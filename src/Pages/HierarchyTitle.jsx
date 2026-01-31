import React, { useState, useEffect } from 'react';
import './HierarchyTitle.css';
import { Trash2, SquarePen } from 'lucide-react';
import CustomDropdown from '../Components/CustomDropdown';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import ConfirmModal from '../Components/ConfirmModal';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { BASE_URL } from '../Services/api';

const HierarchyTitle = () => {
  const [formDataAdd, setFormDataAdd] = useState({ title: '', parentTitleId: '' });
  const [formDataEdit, setFormDataEdit] = useState({
    title: '',
    parentTitleId: '',
    status: 'ACTIVE',
  });
  const [hierarchyTitles, setHierarchyTitles] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const getAuthToken = () => localStorage.getItem('authToken');
  const { canRead, canWrite, canUpdate, canDelete } = useModulePermissions();

  const buildHierarchyOrder = (titles) => {
    const map = {};
    const roots = [];

    titles.forEach((title) => {
      map[title.id] = { ...title, children: [] };
    });

    titles.forEach((title) => {
      if (title.parentTitleId) {
        const parent = map[title.parentTitleId];
        if (parent) parent.children.push(map[title.id]);
      } else {
        roots.push(map[title.id]);
      }
    });

    const orderedList = [];
    const dfs = (node, level = 0) => {
      orderedList.push({ ...node, level });
      node.children.forEach((child) => dfs(child, level + 1));
    };

    roots.forEach((root) => dfs(root));
    return orderedList;
  };

  const fetchTopLevelTitles = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/hierarchy/titles/all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ordered = buildHierarchyOrder(data);
        setHierarchyTitles(ordered);
      } else {
        setError(true);
        setErrorMessage('❌ Failed to fetch data');
      }
    } catch {
      setError(true);
      setErrorMessage('❌ Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchTopLevelTitles();
  }, [fetchTopLevelTitles]);

  const getParentTitleName = (parentId) => {
    const parent = hierarchyTitles.find((t) => t.id === parentId);
    return parent ? parent.title : 'NA';
  };

  const handleAddTitle = async () => {
    if (!formDataAdd.title.trim()) {
      setError(true);
      setErrorMessage('Please enter a hierarchy title.');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/hierarchy/titles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formDataAdd.title,
          parentTitleId: formDataAdd.parentTitleId || null,
        }),
      });

      if (res.ok) {
        setFormDataAdd({ title: '', parentTitleId: '' });
        setShowForm(false);
        await fetchTopLevelTitles();
        setShowSuccessModal(true);
      } else {
        const err = await res.json();
        setError(true);
        setErrorMessage(err.message || '❌ Failed to add title.');
      }
    } catch {
      setError(true);
      setErrorMessage('❌ Failed to add title.');
    }
  };

  const handleUpdateHierarchy = async () => {
    const token = getAuthToken();
    if (!token || !editingId) return;

    try {
      const res = await fetch(`/api/hierarchy/titles/modify/${editingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formDataEdit.title,
          parentTitleId: formDataEdit.parentTitleId || null,
          status: formDataEdit.status.toLowerCase(),
        }),
      });

      if (res.ok) {
        setFormDataEdit({ title: '', parentTitleId: '', status: 'ACTIVE' });
        setEditingId(null);
        setSelectedTitle(null);
        setShowEditModal(false);
        await fetchTopLevelTitles();
        setShowSuccessModal(true);
      } else {
        const err = await res.json();
        setError(true);
        setErrorMessage(err.message || '❌ Failed to update title.');
      }
    } catch {
      setError(true);
      setErrorMessage('❌ Failed to update title.');
    }
  };

  const handleEditClick = (title) => {
    setFormDataEdit({
      title: title.title,
      parentTitleId: title.parentTitleId || '',
      status: title.status?.toUpperCase() || 'ACTIVE',
    });
    setEditingId(title.id);
    setSelectedTitle(title);
    setShowEditModal(true);
  };

  const handleDeleteClick = (title) => {
    setSelectedTitle(title);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = getAuthToken();
    if (!token || !selectedTitle) return;

    try {
      const res = await fetch(`/api/hierarchy/titles/${selectedTitle.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await fetchTopLevelTitles();
        setShowDeleteModal(false);
        setShowSuccessModal(true);
      } else {
        setError(true);
        setErrorMessage('❌ Failed to delete title.');
      }
    } catch {
      setError(true);
      setErrorMessage('❌ Failed to delete title.');
    }
  };

  if (!canRead) {
    setError(true);
    setErrorMessage('you can not access the page');
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h4 className="screen-headings">Hierarchy Titles</h4>
      </div>
      <p className="text-muted">You can manage hierarchy titles from this section.</p>
      <hr />

      <div className="d-flex justify-content-end mb-3">
        <button className="form-open-buttons" onClick={() => setShowForm(!showForm)}>
          {/* {showForm ? 'Hide' : 'Add Title'} */}
          Add Title
        </button>
      </div>

      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-custom-border shadow">
              {/* Header */}
              <div className="modal-header bg-primary text-white py-6">
                <h5 className="modal-title m-0">Add Hierarchy Title</h5>
                <button
                  type="button"
                  className="btn-close bg-white btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTitle();
                }}
              >
                <div className="modal-body p-3">
                  {/* Hierarchy Title */}
                  <div className="mb-2">
                    <label className="label-heading small">Hierarchy Title</label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      style={{ marginTop: '0.02rem' }}
                      value={formDataAdd.title}
                      onChange={(e) => setFormDataAdd({ ...formDataAdd, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Parent Title Dropdown */}
                  <div className="mb-2">
                    <label className="label-heading small">Parent Title</label>
                    <CustomDropdown
                      options={hierarchyTitles}
                      value={formDataAdd.parentTitleId}
                      onChange={(id) => setFormDataAdd({ ...formDataAdd, parentTitleId: id })}
                      isTopLevelAllowed={true}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                  <button
                    type="submit"
                    disabled={!canWrite('Hierarchy Titles')}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '100px' }}
                  >
                    Submit
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="form-headings">Edit Hierarchy Title</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="label-heading">Hierarchy Title</label>
                <input
                  type="text"
                  className="dropdowns "
                  style={{ marginTop: ' 0.1rem' }}
                  value={formDataEdit.title}
                  onChange={(e) => setFormDataEdit({ ...formDataEdit, title: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="label-heading">Parent Title</label>
                <CustomDropdown
                  options={hierarchyTitles}
                  value={formDataEdit.parentTitleId}
                  onChange={(id) => setFormDataEdit({ ...formDataEdit, parentTitleId: id })}
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
                  onChange={(val) => setFormDataEdit({ ...formDataEdit, status: val })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>

              <button
                className="save-button"
                disabled={!canUpdate('Hierarchy Titles')}
                onClick={handleUpdateHierarchy}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Parent</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hierarchyTitles.map((title) => (
              <tr key={title.id} className="parent-row">
                <td>
                  <span style={{ paddingLeft: `${title.level}px` }}>{title.title}</span>
                </td>
                <td>{getParentTitleName(title.parentTitleId)}</td>
                <td>
                  <span
                    className={`badge ${title.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
                  >
                    {title.status}
                  </span>
                </td>
                <td>
                  <button className="edit-icon" onClick={() => handleEditClick(title)}>
                    <SquarePen className="icon" /> Edit
                  </button>
                  <button
                    className="delete-icon"
                    disabled={!canDelete('Hierarchy Titles')}
                    onClick={() => handleDeleteClick(title)}
                  >
                    <Trash2 className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="✅ Operation completed successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
      <ConfirmModal
        show={showDeleteModal}
        title="Confirm Delete"
        message={`Are you sure you want to delete the title: ${selectedTitle?.title}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default HierarchyTitle;
