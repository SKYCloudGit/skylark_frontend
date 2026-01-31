import React, { useState, useEffect } from 'react';
import './DataHierarchy.css';
import DataTable from '../Components/DataTable';
import CustomDropdown from '../Components/CustomDropdown';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import ConfirmModal from '../Components/ConfirmModal';
import { useModulePermissions } from '../hooks/useModulePermissions';

const DataHierarchy = () => {
  const [titles, setTitles] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [formData, setFormData] = useState({});
  const [tableData, setTableData] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getAuthToken = () => localStorage.getItem('authToken');

  const { canWrite, canUpdate, canDelete } = useModulePermissions();

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
    const dfs = (node, level = 0) => {
      orderedList.push({ ...node, level });
      node.children.forEach((child) => dfs(child, level + 1));
    };

    roots.forEach((root) => dfs(root));
    return orderedList;
  };

  useEffect(() => {
    const fetchTitles = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(`/hierarchy/titles/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const ordered = buildHierarchyOrder(data);
        setTitles(ordered);
      } catch (error) {
        setError(true);
        setErrorMessage('❌ Failed to fetch  hierarchy titles.');
      }
    };

    fetchTitles();
    fetchTableData();
  }, []);

  const fetchHierarchyData = async (hierarchyTitleId, parentId = null) => {
    const token = getAuthToken();
    if (!token) return [];

    const url = `/hierarchy/data/titleId=${hierarchyTitleId}${
      parentId ? `/parentId=${parentId}` : ''
    }`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      setError(true);
      setErrorMessage('❌ Failed to fetch hierarchy data.');
      return [];
    }
  };

  const buildHierarchyPath = async (selectedId) => {
    if (!selectedId) return;

    const path = [];
    const options = {};

    let current = titles.find((t) => t.id === selectedId);
    while (current) {
      path.unshift(current);
      current = titles.find((t) => t.id === current.parentTitleId);
    }

    for (let i = 0; i < path.length - 1; i++) {
      const titleId = path[i].id;
      const parentId = i > 0 ? formData[path[i - 1].id] : null;
      const data = await fetchHierarchyData(titleId, parentId);
      options[titleId] = data.map((d) => ({ id: d.id, name: d.name }));
    }

    const lastTitle = path[path.length - 1];
    const lastData = await fetchHierarchyData(lastTitle.id);
    options[lastTitle.id] = lastData.map((d) => ({ id: d.id, name: d.name }));

    setHierarchy(path);
    setDropdownOptions(options);
  };

  const handleSelectChange = async (selectedId) => {
    setSelectedTitle(selectedId);
    setFormData({});
    setDropdownOptions({});
    setHierarchy([]);
    setFormSubmitted(false);
    if (selectedId) await buildHierarchyPath(selectedId);
  };

  const handleParentChange = async (levelId, selectedId) => {
    setFormData((prev) => ({ ...prev, [levelId]: selectedId }));

    const nextIndex = hierarchy.findIndex((item) => item.id === levelId) + 1;
    if (nextIndex < hierarchy.length) {
      const nextTitle = hierarchy[nextIndex];
      const data = await fetchHierarchyData(nextTitle.id, selectedId);
      setDropdownOptions((prev) => ({
        ...prev,
        [nextTitle.id]: data.map((d) => ({ id: d.id, name: d.name })),
      }));
    }
  };

  const handleInputChange = (levelId, value) => {
    setFormData((prevData) => ({ ...prevData, [levelId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    for (let i = 0; i < hierarchy.length; i++) {
      const titleId = hierarchy[i].id;
      if (!formData[titleId] || formData[titleId].trim() === '') {
        return;
      }
    }

    const token = getAuthToken();
    if (!token) return;

    const lastIndex = hierarchy.length - 1;
    const lastInputId = hierarchy[lastIndex]?.id;
    const parentInputId = hierarchy[lastIndex - 1]?.id;
    const selectedParentId = formData[parentInputId] || '';

    const submissionData = {
      name: formData[lastInputId],
      parentId: selectedParentId,
      hierarchyTitleId: hierarchy[lastIndex]?.id,
    };

    try {
      const response = await fetch(`/hierarchy/data`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error(`Submission failed: ${response.status}`);

      setShowSuccessModal(true);
      setSelectedTitle('');
      setHierarchy([]);
      setFormData({});
      setDropdownOptions({});
      setFormSubmitted(false);
      fetchTableData();
    } catch (error) {
      setError(true);
      setErrorMessage('❌ Failed to submit the form.');
    }
  };

  const fetchTableData = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/hierarchy/data/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      setError(true);
      setErrorMessage('❌ Failed to fetch table data.');
    }
  };

  const handleCancelForm = () => {
    setSelectedTitle('');
    setHierarchy([]);
    setFormData({});
    setDropdownOptions({});
    setFormSubmitted(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="screen-headings">Data Hierarchy</h4>
      </div>
      <p className="text-muted">Manage hierarchical data entries for selected titles below.</p>
      <hr />

      <div className="col-md-4 mb-3">
        <label className="label-heading">Select Hierarchy Title :</label>
        <CustomDropdown
          options={titles}
          value={selectedTitle}
          onChange={handleSelectChange}
          label="Select a Title"
          displayKey="title"
          placeholder="Select a Title"
          showError={formSubmitted && !selectedTitle}
        />
      </div>

      {selectedTitle && hierarchy.length > 0 && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered  modal-lg">
            <div className="modal-content card-custom-border shadow">
              <div className="modal-header bg-primary text-white py-6">
                <h6 className="modal-title">Add Data Hierarchy</h6>
                <button
                  type="button"
                  className="btn-close btn-close-black"
                  aria-label="Close"
                  onClick={handleCancelForm}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-3">
                  <div className="row">
                    {hierarchy.map((title, index) => {
                      const value = formData[title.id] || '';
                      const showError = formSubmitted && (!value || value.trim() === '');
                      const isLast = index === hierarchy.length - 1;

                      return (
                        <div key={title.id} className="col-md-6 mb-2">
                          <label className="label-heading small">
                            {isLast ? `Enter ${title.title} Name:` : `Select ${title.title}:`}
                          </label>

                          {isLast ? (
                            <input
                              type="text"
                              className={`dropdowns input-tight${showError ? 'is-invalid' : ''}`}
                              style={{ marginTop: '0.02rem' }}
                              placeholder={`Enter ${title.title} name`}
                              value={value}
                              onChange={(e) => handleInputChange(title.id, e.target.value)}
                            />
                          ) : (
                            <CustomDropdown
                              options={dropdownOptions[title.id] || []}
                              value={value}
                              onChange={(val) => handleParentChange(title.id, val)}
                              displayKey="name"
                              placeholder="Select option"
                              showError={showError}
                              size="sm"
                            />
                          )}

                          {showError && (
                            <div className="invalid-feedback d-block small">
                              Please fill out this field.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '100px' }}
                    disabled={!canWrite('Add Hierarchy ')}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    style={{ minWidth: '100px' }}
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="✅ Data added successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
      <ConfirmModal
        show={showConfirmModal}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        confirmText="Yes"
        cancelText="No"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          // handleConfirmedAction()
        }}
      />

      <div className="table-responsive" style={{ marginBottom: '10rem' }}>
        <DataTable hierarchy={hierarchy} tableData={tableData} />
      </div>
    </div>
  );
};

export default DataHierarchy;
