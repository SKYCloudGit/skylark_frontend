import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash, ChevronDown, ChevronRight } from 'lucide-react';
import './Assign.css';
import GoBack from '../Components/GoBack';
import { BASE_URL } from '../Services/api';

// Modals
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import ConfirmModal from '../Components/ConfirmModal';

const Assign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const userName = location.state?.userName || 'User';
  const token = localStorage.getItem('authToken');

  const [allModules, setAllModules] = useState([]);
  const [assignedModules, setAssignedModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [permissions, setPermissions] = useState({
    read: false,
    write: false,
    update: false,
    delete: false,
  });

  const [expandedParents, setExpandedParents] = useState(() => new Set());

  // Modals state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccessRightId, setSelectedAccessRightId] = useState(null);

  useEffect(() => {
    if (!userId) navigate('/user/userlist');
  }, [userId, navigate]);

  // Fetch all modules + assigned modules
  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allResp, assignedResp] = await Promise.all([
          fetch(`/api/data/module/getAll`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/data/moduleAccessRight/userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!allResp.ok || !assignedResp.ok) throw new Error('Fetch failed');

        const allData = await allResp.json();
        const assignedData = await assignedResp.json();

        setAllModules(allData);
        setAssignedModules(assignedData);

        refreshAvailableModules(allData, assignedData);
      } catch (e) {
        setErrorMessage('❌ Failed to fetch modules');
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, token]);

  // Refresh assigned modules from server
  const refreshAssigned = async () => {
    try {
      const resp = await fetch(`/api/data/moduleAccessRight/userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Refresh failed');
      const data = await resp.json();
      setAssignedModules(data);

      refreshAvailableModules(allModules, data);
    } catch (e) {
      setErrorMessage('❌ Failed to refresh assigned modules');
      setError(true);
    }
  };

  // Refresh available modules based on assigned modules
  const refreshAvailableModules = (all, assigned) => {
    const assignedIds = new Set(assigned.map((a) => a.moduleId));

    const filterAvailable = (modules) =>
      modules
        .map((m) => {
          if (m.subModules && m.subModules.length > 0) {
            const availableChildren = filterAvailable(m.subModules);
            if (availableChildren.length > 0) {
              return { ...m, subModules: availableChildren };
            }
            return null; // all children assigned, hide parent
          }
          return assignedIds.has(m.id) ? null : m;
        })
        .filter(Boolean);

    setAvailableModules(filterAvailable(all));
  };

  const handleAssignClick = (module) => {
    setSelectedModule(module);
    setPermissions({ read: false, write: false, update: false, delete: false });
    setShowModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedModule) return;
    try {
      const resp = await fetch(`/api/data/moduleAccessRight/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, moduleId: selectedModule.id, ...permissions }),
      });
      if (!resp.ok) throw new Error('Assign failed');
      setShowModal(false);
      setSelectedModule(null);
      refreshAssigned();
      setShowSuccessModal(true);
    } catch (e) {
      setErrorMessage('❌ Error assigning module');
      setError(true);
    }
  };

  const togglePermissionCheckbox = (perm) =>
    setPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));

  const handleRemove = (accessRightId) => {
    setSelectedAccessRightId(accessRightId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const resp = await fetch(`/api/data/moduleAccessRight/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accessRightId: selectedAccessRightId }),
      });
      if (!resp.ok) throw new Error('Remove failed');
      refreshAssigned();
      setShowSuccessModal(true);
    } catch (e) {
      setErrorMessage('❌ Error removing module');
      setError(true);
    } finally {
      setShowDeleteModal(false);
      setSelectedAccessRightId(null);
    }
  };

  const togglePermission = async (accessRightId, field, current) => {
    try {
      await fetch(`/api/data/moduleAccessRight/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accessRightId, [field]: !current }),
      });
      refreshAssigned();
      setShowSuccessModal(true);
    } catch (e) {
      setErrorMessage('❌ Error updating permission');
      setError(true);
    }
  };

  const assignedModuleIds = new Set(assignedModules.map((mod) => mod.module?.id || mod.id));

  const toggleExpand = (mod) => {
    if (!assignedModuleIds.has(mod.id)) return;

    setExpandedParents((prev) => {
      const s = new Set(prev);
      if (s.has(mod.id)) s.delete(mod.id);
      else s.add(mod.id);
      return s;
    });
  };

  // Recursive module tree for available modules
  const ModuleTree = ({ modules }) => {
    if (!modules || modules.length === 0) return null;
    return (
      <ul className="list-group">
        {modules.map((mod) => {
          const isParent = mod.subModules && mod.subModules.length > 0;
          const isExpanded = expandedParents.has(mod.id);
          const isAssigned = assignedModuleIds.has(mod.id);
          return (
            <li key={mod.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  {isParent && (
                    <span
                      onClick={() => toggleExpand(mod)}
                      style={{
                        cursor: isAssigned ? 'pointer' : 'not-allowed',
                        marginRight: 8,
                        opacity: isAssigned ? 1 : 0.5,
                      }}
                      title={isAssigned ? 'Expand' : 'Assign parent first'}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                  <span>{mod.name}</span>
                </div>
                <button
                  onClick={() => handleAssignClick(mod)}
                  className="btn btn-sm btn-primary"
                  disabled={isAssigned}
                  title={isAssigned ? 'Already assigned' : 'Assign module'}
                >
                  + Assign
                </button>
              </div>

              {isParent && isExpanded && (
                <div className="ms-4 mt-2">
                  <ModuleTree modules={mod.subModules} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className="main-content mt-4">
        <div className="mt-4">
          <GoBack />
        </div>
        <div className="assign-modules-page">
          <h2 className="page-title">Assign Modules to User</h2>

          <div className="available-section">
            <h3>Available Modules ({availableModules.length})</h3>
            <p>Modules available to assign to this user</p>
            {availableModules.length === 0 ? (
              <p className="no-modules">No available modules to assign.</p>
            ) : (
              <ModuleTree modules={availableModules} />
            )}
          </div>

          <div className="modules-grid mt-5">
            <div className="assigned-section">
              <h3>Assigned Modules ({assignedModules.length})</h3>
              <p>Modules currently assigned to this user with permissions</p>
              {assignedModules.length === 0 ? (
                <p className="no-modules">No modules assigned.</p>
              ) : (
                assignedModules.map((mod) => (
                  <div key={mod.id} className="module-card">
                    <div className="module-header">
                      <strong>{mod.module?.name}</strong>
                      <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                        <button
                          onClick={() => togglePermission(mod.id, 'update', mod.update)}
                          className="btn btn-primary btn-sm"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleRemove(mod.id)}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="permissions-toggle">
                      <div className="permissions-title">Permissions</div>
                      <div className="permissions-row">
                        <label className="permission-item">
                          <Eye size={16} className="perm-icon" />
                          <span className="perm-label">View</span>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={mod.read}
                            onChange={() => togglePermission(mod.id, 'read', mod.read)}
                          />
                        </label>
                        <label className="permission-item">
                          <Pencil size={16} className="perm-icon" />
                          <span className="perm-label">Update</span>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={mod.update}
                            onChange={() => togglePermission(mod.id, 'update', mod.update)}
                          />
                        </label>
                        <label className="permission-item">
                          <Trash size={16} className="perm-icon" />
                          <span className="perm-label">Delete</span>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={mod.delete}
                            onChange={() => togglePermission(mod.id, 'delete', mod.delete)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Updated Bootstrap Modal */}
      {showModal && selectedModule && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-custom-border shadow">
              {/* Header */}
              <div className="modal-header bg-primary text-white py-2">
                <h5 className="modal-title m-0">Assign Module</h5>
                <button
                  type="button"
                  className="btn-close bg-white btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body p-3">
                <p>
                  <strong>User:</strong> {userName}
                </p>
                <p>
                  <strong>Module:</strong> {selectedModule.name}
                </p>

                {/* Permissions */}
                <div className="mb-3">
                  <label className="label-heading small d-block mb-1">Permissions</label>
                  <div className="d-flex flex-wrap gap-3">
                    <label className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={permissions.read}
                        onChange={() => togglePermissionCheckbox('read')}
                      />
                      <span className="form-check-label">View</span>
                    </label>

                    <label className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={permissions.write}
                        onChange={() => togglePermissionCheckbox('write')}
                      />
                      <span className="form-check-label">Write</span>
                    </label>

                    <label className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={permissions.update}
                        onChange={() => togglePermissionCheckbox('update')}
                      />
                      <span className="form-check-label">Update</span>
                    </label>

                    <label className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={permissions.delete}
                        onChange={() => togglePermissionCheckbox('delete')}
                      />
                      <span className="form-check-label">Delete</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleConfirmAssign}
                  style={{ minWidth: '100px' }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="✅ Operation completed successfully!"
      />

      {/* Error Modal */}
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Confirm Delete"
        message="Are you sure you want to remove this module?"
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default Assign;
