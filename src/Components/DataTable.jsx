import React, { useState, useEffect } from 'react';
import CustomPagination from './CustomPagination';
import CustomDropdown from '../Components/CustomDropdown';
import './DataTable.css';
import { Trash2, SquarePen } from 'lucide-react';
import ErrorModal from '../Components/ErrorModal';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { BASE_URL } from '../Services/api';

const DataTable = ({ tableData, hierarchy, titles, refreshTableData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [hierarchyLevels, setHierarchyLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 Search state

  const [formDataEdit, setFormDataEdit] = useState({
    name: '',
    parentId: '',
    hierarchyTitleId: '',
    status: 'ACTIVE',
  });

  const getAuthToken = () => localStorage.getItem('authToken');

  const { canUpdate, canDelete } = useModulePermissions();

  // -------- Build Hierarchy Order --------
  const buildHierarchyOrder = (titles) => {
    const map = {};
    const roots = [];

    titles.forEach((title) => {
      map[title.id] = { ...title, children: [] };
    });

    titles.forEach((title) => {
      if (title.parentTitleId) {
        const parent = map[title.parentTitleId];
        if (parent) {
          parent.children.push(map[title.id]);
        }
      } else {
        roots.push(map[title.id]);
      }
    });

    const orderedList = [];
    const visited = new Set();

    const dfs = (node) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      orderedList.push(node);
      node.children.forEach(dfs);
    };

    roots.forEach(dfs);
    return orderedList;
  };

  // -------- Fetch Hierarchy Titles --------
  const fetchTopLevelTitles = async () => {
    const token = getAuthToken();
    if (!token) {
      setError(true);
      setErrorMessage('No auth token found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/data/meter/mapped`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ordered = buildHierarchyOrder(data);
        setHierarchyLevels(ordered);
        setSelectedLevel(ordered[0]?.title || null);
      } else {
        setError(true);
        setErrorMessage('Failed to fetch hierarchy titles');
      }
    } catch (error) {
      setError(true);
      setErrorMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopLevelTitles();
  }, []);

  // -------- Helpers --------
  const hierarchyMap = tableData?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const getHierarchyPath = (item) => {
    const path = [];
    let current = item;
    while (current) {
      path.unshift(current);
      current = current.parentId ? hierarchyMap[current.parentId] : null;
    }
    return path;
  };

  if (loading) return <div>Loading hierarchy levels...</div>;
  if (error) return <div>Error: {errorMessage}</div>;
  if (!hierarchyLevels.length) return <div>No hierarchy data found.</div>;

  // -------- Filtered Headers --------
  const selectedLevelIndex = hierarchyLevels.findIndex((level) => level.title === selectedLevel);
  const filteredHeaders = hierarchyLevels.slice(0, selectedLevelIndex + 1);

  // -------- Filter Valid Entries --------
  const uniqueEntries = new Set();
  let validEntries =
    tableData?.filter((row) => {
      const path = getHierarchyPath(row);
      if (selectedLevelIndex === 0) return !row.parentId;
      if (path.length <= selectedLevelIndex) return false;

      const key = path
        .slice(0, selectedLevelIndex + 1)
        .map((p) => p?.name)
        .join('>');
      if (uniqueEntries.has(key)) return false;
      uniqueEntries.add(key);
      return path[selectedLevelIndex]?.name && path[selectedLevelIndex].name !== '-';
    }) || [];

  // 🔍 Apply search filter
  if (searchQuery.trim() !== '') {
    validEntries = validEntries.filter((row) => {
      const path = getHierarchyPath(row);
      return path.some((p) => p?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }

  const totalPages = Math.ceil(validEntries.length / rowsPerPage);

  const handleChangePage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRows) => {
    setRowsPerPage(newRows);
    setPage(0);
  };

  // -------- Edit + Delete Handlers --------
  const handleEditClick = (item) => {
    setFormDataEdit({
      name: item.name,
      parentId: item.parentId || '',
      hierarchyTitleId: item.hierarchyTitleId || '',
      status: item.status?.toUpperCase() || 'ACTIVE',
    });
    setEditingId(item.id);
    setSelectedTitle(item);
    setShowEditModal(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedTitle(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = getAuthToken();
    if (!token || !selectedTitle) return;

    try {
      const response = await fetch(`/hierarchy/data/${selectedTitle.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTopLevelTitles();
        setShowDeleteModal(false);
      } else {
        setError(true);
        setErrorMessage('Failed to delete data');
      }
    } catch (error) {
      setError(true);
      setErrorMessage('Network error');
    }
  };

  const handleUpdateHierarchy = async () => {
    const token = getAuthToken();
    if (!token) {
      setError(true);
      setErrorMessage('Authentication token missing.');
      return;
    }

    const payload = {
      name: formDataEdit.name,
      parentId: formDataEdit.parentId || null,
      hierarchyTitleId: formDataEdit.hierarchyTitleId || null,
      status: formDataEdit.status.toLowerCase(),
    };

    try {
      const response = await fetch(`/api/hierarchy/data/modify/${editingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormDataEdit({ name: '', parentId: '', hierarchyTitleId: '', status: 'ACTIVE' });
        setEditingId(null);
        setSelectedTitle(null);
        setShowEditModal(false);
        await fetchTopLevelTitles();
      } else {
        const errorData = await response.json();
        setError(true);
        setErrorMessage(errorData.message || 'Update failed');
      }
    } catch (error) {
      setError(true);
      setErrorMessage('Network error: ' + error.message);
    }
  };

  // -------- Render --------
  return (
    <div className="data-table mt-4">
      {/* Level Selection Buttons */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        {/* Left: Level Selection Buttons */}
        <div className="d-flex flex-wrap gap-2">
          {hierarchyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => {
                if (selectedLevel !== level.title) {
                  setSelectedLevel(level.title);
                  setPage(0);
                }
              }}
              className={`submit-buttons ${
                selectedLevel === level.title ? 'text-white' : 'text-dark bg-transparent'
              }`}
              style={
                selectedLevel === level.title
                  ? { backgroundColor: '#7C3AED', borderColor: '#7C3AED' }
                  : { borderColor: '#7C3AED' }
              }
            >
              {level.title}
            </button>
          ))}
        </div>

        {/* Right: Search Bar */}
        <div className="col-md-4 mr-1" style={{ marginRight: '0.5rem' }}>
          <label className="label-heading">Search:</label>
          <input
            type="text"
            className="dropdowns input-tight"
            style={{ marginTop: '0.01rem' }}
            placeholder="Search all fields..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0); // reset to first page on new search
            }}
          />
        </div>
      </div>

      {/* Table Display */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {filteredHeaders.map((header) => (
                <th key={header.id}>{header.title}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {validEntries
              .sort((a, b) => {
                const stateA = getHierarchyPath(a)[0]?.name || '';
                const stateB = getHierarchyPath(b)[0]?.name || '';
                return stateA.localeCompare(stateB);
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const path = getHierarchyPath(row);
                return (
                  <tr key={index} className="parent-row">
                    {filteredHeaders.map((_, i) => (
                      <td key={i}>{path[i]?.name || '-'}</td>
                    ))}
                    <td>
                      <button
                        className="edit-icon"
                        disabled={!canUpdate('Add Hierarchy ')}
                        onClick={() => handleEditClick(row)}
                      >
                        <SquarePen className="icon" /> Edit
                      </button>

                      <button
                        className="delete-icon"
                        disabled={!canDelete('Add Hierarchy ')}
                        onClick={() => handleDeleteClick(row)}
                      >
                        <Trash2 className="icon" />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <CustomPagination
        count={totalPages}
        page={page}
        onChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit Modal */}
      <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="form-headings">Edit Hierarchy Data</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="label-heading">Name</label>
                <input
                  type="text"
                  className="input-text input-tight"
                  value={formDataEdit.name}
                  onChange={(e) => setFormDataEdit({ ...formDataEdit, name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="label-heading">Parent </label>
                <input
                  className="input-text input-tight"
                  value={
                    tableData?.find((item) => String(item.id) === String(formDataEdit.parentId))
                      ?.name || '-'
                  }
                  disabled
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label className="label-heading">Hierarchy Title</label>
                <input
                  type="text"
                  className="input-text input-tight"
                  value={
                    hierarchyLevels.find((l) => l.id === formDataEdit.hierarchyTitleId)?.title ||
                    '-'
                  }
                  disabled
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label className="label-heading">Status</label>
                <CustomDropdown
                  options={[
                    { id: 'ACTIVE', title: 'Active' },
                    { id: 'INACTIVE', title: 'Inactive' },
                  ]}
                  value={formDataEdit.status}
                  onChange={(status) => setFormDataEdit({ ...formDataEdit, status })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={handleUpdateHierarchy}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{selectedTitle?.name}</strong>?
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default DataTable;
