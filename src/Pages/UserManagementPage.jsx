import React, { useState, useEffect } from 'react';
import './HierarchyTitle.css';
import axios from 'axios';
import { EditUserDialog } from './Dialog'; // Ensure path is correct
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../Components/CustomPagination';
import ErrorModal from '../Components/ErrorModal';
import SuccessModal from '../Components/SuccessModal'; // 👈 Add this
import CustomDropdown from '../Components/CustomDropdown';
import { useModulePermissions } from '../hooks/useModulePermissions';
import ActionDropdown from '../Components/ActionDropdown';
import ConfirmModal from '../Components/ConfirmModal';
import AssignAreaDialog from '../Components/AssignAreaDialog';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  // dialogs
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignAreaDialog, setShowAssignAreaDialog] = useState(false);

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { canWrite } = useModulePermissions();

  // Modal state
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    firstName: '',
    secondName: '',
    emailAddress: '',
    phoneNumber: '',
    password: '',
    cpassword: '',
    userRole: 'customer',
  });

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setErrorModal({ show: true, message: 'You are not authenticated. Please log in.' });
      return null;
    }
    return token;
  };

  const fetchUsers = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`/auth/user/all`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorModal({ show: true, message: '❌ Failed to fetch users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        [user.userName, user.firstName, user.secondName, user.email].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.userRole === roleFilter);
    }
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleChangePage = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(filteredUsers.length / rowsPerPage)) {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (newRows) => {
    setRowsPerPage(newRows);
    setPage(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    if (formData.password !== formData.cpassword) {
      setErrorModal({ show: true, message: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setErrorModal({
        show: true,
        message:
          'Password must include at least 1 uppercase letter, 1 number, and 1 special character.',
      });
      setLoading(false);
      return;
    }


    try {
      await axios.post(`/auth/signup`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      setSuccessModal({ show: true, message: 'User added successfully!' });
      setFormData({
        userName: '',
        firstName: '',
        secondName: '',
        emailAddress: '',
        phoneNumber: '',
        password: '',
        cpassword: '',
        userRole: 'customer',
      });
      fetchUsers();
      setShowForm(false);
    } catch (err) {
      setErrorModal({ show: true, message: err.response?.data?.message || 'Failed to add user.' });
    } finally {
      setLoading(false);
    }
  };
  // Inside UserManagementPage component, at the top
  const handleToggleUser = async (userId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/auth/user/toggleStatus/id=${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());

      setSuccessModal({ show: true, message: 'User status toggled successfully!' });
      fetchUsers();
    } catch (err) {
      setErrorModal({ show: true, message: 'Failed to toggle status.' });
    }
  };

  const handleAssignArea = async (userId, hierarchyDataId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/auth/user/hierarchy/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            userId: userId,
            hierarchyDataId: hierarchyDataId || null,
          },
        ]),
      });

      if (response.ok) {
        setSuccessModal({ show: true, message: '✅ Area assigned successfully!' });
        fetchUsers();
      } else {
        const error = await response.json();
        setErrorModal({ show: true, message: error.message || '❌ Failed to assign area.' });
      }
    } catch (err) {
      setErrorModal({ show: true, message: '❌ Failed to assign area (network error).' });
    }
  };

  const handleDeleteUser = async () => {
    const token = getAuthToken();
    if (!token) return;

    const userToDelete = users.find((u) => u.id === selectedUserId);
    if (!userToDelete?.keycloakId) {
      setErrorModal({ show: true, message: 'User Keycloak ID is missing!' });
      return;
    }

    try {
      const response = await fetch(`/auth/user/${userToDelete.keycloakId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(await response.text());

      setSuccessModal({ show: true, message: 'User deleted successfully!' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorModal({ show: true, message: 'Error deleting user.' });
    } finally {
      setShowDeleteDialog(false);
      setSelectedUserId(null);
    }
  };

  if (loading) return <div className="loading-spinner">Loading users...</div>;

  return (
    <div className="container mt-4">
      <h4 className="screen-headings">User List</h4>
      <p className="text-muted">Here we can view all users</p>
      <hr />

      {/* Filter & Search */}
      <div className="row d-flex justify-content-space-between mb-3 g-2">
        <div className="col-md-3">
          <label className="label-heading">Filter:</label>
          <CustomDropdown
            options={[
              { id: 'all', name: 'All Roles' },
              { id: 'admin', name: 'Admin' },
              { id: 'customer', name: 'Customer' },
            ]}
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            displayKey="name"
            placeholder="Select Role"
          />
        </div>

        <div className="col-md-5">
          <label className="label-heading small">Search:</label>
          <input
            type="text"
            className="dropdowns input-tight"
            style={{ marginTop: '0.02rem' }}
            placeholder="Search all fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-md-4" style={{ marginTop: '2rem' }}>
          <button
            className="form-open-buttons"
            style={{ marginLeft: '18rem' }}
            disabled={!canWrite('User List')}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Hide' : 'Add User'}
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content card-custom-border shadow">
              <div className="modal-header bg-primary text-white py-6">
                <h5 className="modal-title m-0">Add User</h5>
                <button
                  type="button"
                  className="btn-close bg-white btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-3">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">First Name</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Second Name</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        name="secondName"
                        value={formData.secondName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Username</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Email</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        name="emailAddress"
                        value={formData.emailAddress}
                        placeholder="example@domain.com"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Phone Number</label>
                      <input
                        type="tel"
                        className="dropdowns input-tight"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Password</label>
                      <input
                        type="password"
                        className="dropdowns input-tight"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Confirm Password</label>
                      <input
                        type="password"
                        className="dropdowns input-tight"
                        name="cpassword"
                        value={formData.cpassword}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small mt-1">User Role</label>
                      <CustomDropdown
                        options={[
                          { id: 'customer', title: 'Customer' },
                          { id: 'admin', title: 'Admin' },
                          { id: 'superadmin', title: 'Super Admin' },
                        ]}
                        value={formData.userRole}
                        onChange={(id) => setFormData({ ...formData, userRole: id })}
                        isTopLevelAllowed={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                  <button
                    type="submit"
                    disabled={!canWrite('User List')}
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

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <tr key={user.id}>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>{user.number}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.userRole === 'admin' ? 'bg-success' : 'bg-secondary'
                      }`}
                    >
                      {user.userRole}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.status === 'active' ? 'bg-success' : 'bg-secondary'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button
                      className="edit-icon"
                      onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                    >
                      ⚙️
                    </button>
                    <ActionDropdown
                      isOpen={openDropdownId === user.id}
                      onClose={() => setOpenDropdownId(null)}
                      actions={[
                        {
                          label: 'Update Profile',
                          icon: '👤',
                          onClick: () => {
                            setSelectedUser(user);
                            setShowEdit(true);
                          },
                        },
                        {
                          label: 'Change Role',
                          icon: '🛠️',
                          onClick: () => {
                            setSelectedUserId(user.id);
                            setShowChangeRoleDialog(true);
                          },
                        },
                        {
                          label: 'Reset Password',
                          icon: '🔑',
                          onClick: () => {
                            setSelectedUserId(user.id);
                            setShowResetPasswordDialog(true);
                          },
                        },
                        {
                          label: 'Toggle User',
                          icon: '🔄',
                          onClick: () => handleToggleUser(user.id),
                        },
                        {
                          label: 'Assign Area',
                          icon: '🗺️',
                          onClick: () => {
                            setSelectedUserId(user.id);
                            setShowAssignAreaDialog(true);
                          },
                        },

                        {
                          label: 'Delete User',
                          icon: '🗑️',
                          onClick: () => {
                            setSelectedUserId(user.id);
                            setShowDeleteDialog(true);
                          },
                        },
                      ]}
                    />
                    <button
                      className="delete-icon"
                      onClick={() =>
                        navigate('/user/userlist/assign-modules', {
                          state: { userId: user.id, userName: user.userName },
                        })
                      }
                    >
                      📦 Assign Modules
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <CustomPagination
        count={Math.ceil(filteredUsers.length / rowsPerPage)}
        page={page}
        onChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Dialogs */}
      <EditUserDialog
        show={showEdit}
        onClose={() => setShowEdit(false)}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        userId={selectedUser.id}
        fetchUsers={fetchUsers}
        onSuccess={(msg) => setSuccessModal({ show: true, message: msg })}
      />
      <AssignAreaDialog
        show={showAssignAreaDialog}
        onClose={() => setShowAssignAreaDialog(false)}
        userId={selectedUserId}
        onAssign={handleAssignArea}
      />

      <ChangeRoleDialog
        show={showChangeRoleDialog}
        onClose={() => setShowChangeRoleDialog(false)}
        userId={selectedUserId}
        fetchUsers={fetchUsers}
        onSuccess={(msg) => setSuccessModal({ show: true, message: msg })}
      />
      <ResetPasswordDialog
        show={showResetPasswordDialog}
        onClose={() => setShowResetPasswordDialog(false)}
        userId={selectedUserId}
        fetchUsers={fetchUsers}
        onSuccess={(msg) => setSuccessModal({ show: true, message: msg })}
      />
      <ConfirmModal
        show={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteUser}
        title="Confirm Delete"
        message={`Delete user: ${users.find((u) => u.id === selectedUserId)?.userName || ''}?`}
        confirmText="Yes"
        cancelText="No"
        onSuccess={(msg) => setSuccessModal({ show: true, message: msg })}
      />

      {/* Error / Success Modals */}
      <ErrorModal
        show={errorModal.show}
        onClose={() => setErrorModal({ show: false, message: '' })}
        message={errorModal.message}
      />
      <SuccessModal
        show={successModal.show}
        onClose={() => setSuccessModal({ show: false, message: '' })}
        message={successModal.message}
      />
    </div>
  );
};

export default UserManagementPage;
