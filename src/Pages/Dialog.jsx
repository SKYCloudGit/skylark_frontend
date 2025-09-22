import React, { useEffect, useState } from 'react';
import './Dialog.css';
import { BASE_URL } from '../Services/api';
import CustomDropdown from '../Components/CustomDropdown';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';

export const AddUserDialog = ({ show, onClose, onAdd, newUser = {}, setNewUser, onSuccess }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Add New User</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={newUser.username || ''}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={newUser.name || ''}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={newUser.email || ''}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Mobile</label>
            <input
              type="text"
              value={newUser.mobile || ''}
              onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={newUser.role || ''}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onAdd}>
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EditUserDialog = ({
  show,
  onClose,
  selectedUser = {},
  setSelectedUser,
  userId,
  fetchUsers,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getAuthToken = () => localStorage.getItem('authToken');

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !show) return;
      const token = getAuthToken();
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`/auth/user/id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();
        setSelectedUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, show, setSelectedUser]);

  const handleUpdateUser = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setSaving(true);
      const response = await fetch(`/auth/user/modify/${selectedUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userName: selectedUser.userName,
          firstName: selectedUser.firstName,
          secondName: selectedUser.secondName,
          email: selectedUser.email,
          number: selectedUser.number,
          userRole: selectedUser.userRole,
          status: selectedUser.status ?? 'active',
        }),
      });
      if (!response.ok) throw new Error(await response.text());

      if (response.ok) {
        if (onSuccess) onSuccess('User Updated successfully!');

        if (fetchUsers) fetchUsers();
        onClose();
      }
    } catch (error) {
      setError(true);
      setErrorMessage('Error updating. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className={`modal fade show d-block`} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="form-headings">Edit User</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p=3">
            <div className="row">
              <div className="col-md-6 mb-2">
                <label className="label-heading">Username (read-only)</label>
                <input
                  type="text"
                  className="dropdowns"
                  value={selectedUser.userName || ''}
                  readOnly
                />
              </div>
              <div className="col-md-6 mb-2">
                <label className="label-heading">First Name</label>
                <input
                  type="text"
                  className="dropdowns"
                  value={selectedUser.firstName || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                />
              </div>
              <div className="col-md-6 mb-2">
                <label className="label-heading">Second Name</label>
                <input
                  type="text"
                  className="dropdowns"
                  value={selectedUser.secondName || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, secondName: e.target.value })}
                />
              </div>
              <div className="col-md-6 mb-2">
                <label className="label-heading">Mobile</label>
                <input
                  type="text"
                  className="dropdowns"
                  value={selectedUser.number || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, number: e.target.value })}
                />
              </div>
              <div className="col-md-6 mb-2">
                <label className="label-heading">Role</label>
                <CustomDropdown
                  value={selectedUser.userRole || ''}
                  onChange={(selectedValue) =>
                    setSelectedUser({ ...selectedUser, userRole: selectedValue })
                  }
                  options={[
                    { id: '', title: 'Select Role' },
                    { id: 'admin', title: 'Admin' },
                    { id: 'customer', title: 'Customer' },
                  ]}
                />
              </div>
              <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ minWidth: '100px' }}
                  onClick={handleUpdateUser}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        message="✅ User updated successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};
