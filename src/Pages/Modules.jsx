import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import CustomDropdown from '../Components/CustomDropdown';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import { BASE_URL } from '../Services/api';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [moduleName, setModuleName] = useState('');
  const [parentId, setParentId] = useState('');
  const [fetchedModules, setFetchedModules] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Success & Error state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getAuthToken = () => localStorage.getItem('authToken') || null;

  const organizeModules = (modules) => {
    const map = {};
    const root = [];

    modules.forEach((mod) => {
      map[mod.id] = { ...mod, submodules: [] };
    });

    modules.forEach((mod) => {
      if (mod.parentId && map[mod.parentId]) {
        map[mod.parentId].submodules.push(map[mod.id]);
      } else {
        root.push(map[mod.id]);
      }
    });

    return root;
  };

  const fetchModules = useCallback(async () => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/data/module/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const organized = organizeModules(data);
        setModules(organized);
        setFetchedModules(data);
      } else {
        setError(true);
        setErrorMessage('❌ Failed to fetch modules');
      }
    } catch {
      setError(true);
      setErrorMessage('❌ Something went wrong while fetching modules');
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddModule = async () => {
    if (!moduleName.trim()) {
      setError(true);
      setErrorMessage('Please enter a module name.');
      return;
    }

    const token = getAuthToken();
    try {
      const response = await fetch(`/data/module/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: moduleName, parentId: parentId || null }),
      });

      if (response.ok) {
        setModuleName('');
        setParentId('');
        setShowForm(false);
        setShowSuccessModal(true);
        await fetchModules();
      } else {
        const errorData = await response.json();
        setError(true);
        setErrorMessage(errorData.message || '❌ Failed to add module.');
      }
    } catch {
      setError(true);
      setErrorMessage('❌ Failed to add module.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h4 className="screen-headings">Modules</h4>
      </div>
      <p className="text-muted">You can add modules from this section.</p>
      <hr />

      <div className="d-flex justify-content-end mb-3">
        <button className="form-open-buttons" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hide' : 'Add Module'}
        </button>
      </div>

      {/* Add Module Modal */}
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
                <h5 className="modal-title m-0">Add Module</h5>
                <button
                  type="button"
                  className="btn-close bg-white btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddModule();
                }}
              >
                <div className="modal-body p-3">
                  {/* Module Name */}
                  <div className="mb-2">
                    <label className="label-heading small">Module Name</label>
                    <input
                      type="text"
                      className="input-text form-control form-control-sm"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Parent Module Dropdown */}
                  <div className="mb-2">
                    <label className="label-heading small">Parent Module</label>
                    <CustomDropdown
                      options={fetchedModules.map((mod) => ({
                        id: mod.id,
                        title: mod.name,
                      }))}
                      value={parentId}
                      onChange={(id) => setParentId(id)}
                      placeholder="Select parent module (optional)"
                      isTopLevelAllowed={true}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                  <button
                    type="submit"
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

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Module</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod, index) => (
              <React.Fragment key={mod.id}>
                <tr className="parent-row" onClick={() => toggleRow(mod.id)}>
                  <td>{index + 1}</td>
                  <td>
                    {mod.subModules?.length > 0 ? (
                      expandedRows[mod.id] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )
                    ) : (
                      <span style={{ width: '16px', display: 'inline-block' }}></span>
                    )}
                    <span className="ms-2 ">{mod.name}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${mod.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {mod.status || 'Active'}
                    </span>
                  </td>
                </tr>
                {expandedRows[mod.id] &&
                  mod.subModules?.map((sub) => (
                    <tr key={sub.id} className="submodule-row">
                      <td></td>
                      <td style={{ paddingLeft: '32px' }}>{sub.name}</td>
                      <td>{sub.status || 'Active'}</td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="✅ Module added successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default Modules;
