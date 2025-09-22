// Profile.jsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Trash2, SquarePen } from 'lucide-react';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import ConfirmModal from '../Components/ConfirmModal';
import CustomDropdown from '../Components/CustomDropdown';
import axios from 'axios';
import { BASE_URL } from '../Services/api';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [editForm, setEditForm] = useState({
    userName: '',
    firstName: '',
    secondName: '',
    email: '',
    number: '',
    userRole: '',
    status: '',
  });

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });

  const [ip, setIp] = useState(null);
  const [location, setLocation] = useState(null);

  // Modal states
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const token = localStorage.getItem('authToken');

  // Fetch user profile
  const fetchUserProfile = () => {
    fetch(`/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then((data) => {
        setUserData(data);
        setEditForm({
          userName: data.userName || '',
          firstName: data.firstName || '',
          secondName: data.secondName || '',
          email: data.email || '',
          number: data.number || '',
          userRole: data.userRole?.toLowerCase() || '',
          status: data.status?.toLowerCase() || '',
        });
      })
      .catch((err) => setError({ show: true, message: err.message }));
  };

  // Fetch IP & Location
  const fetchIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const { ip } = await res.json();
      return ip;
    } catch {
      return null;
    }
  };

  const fetchLocation = async (ip) => {
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await res.json();
      if (data.status === 'success') {
        return {
          city: data.city,
          country: data.country,
          isp: data.isp,
          timeZone: data.timeZone,
          org: data.org,
        };
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    fetchUserProfile();
    const loadIpAndLocation = async () => {
      const gotIp = await fetchIp();
      if (gotIp) {
        setIp(gotIp);
        const loc = await fetchLocation(gotIp);
        if (loc) setLocation(loc);
      }
    };
    loadIpAndLocation();
  }, []);

  // Edit profile
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!userData?.id) return;

    fetch(`/auth/user/modify/${userData.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
      })
      .then(() => {
        fetchUserProfile();
        setShowEditModal(false);
        setSuccess(true);
      })
      .catch((err) => setError({ show: true, message: err.message }));
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError({ show: false, message: '' });

    if (!token || !userData?.id) {
      setError({ show: true, message: '❌ Missing auth token or user ID.' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError({ show: true, message: '❌ Passwords do not match.' });
      return;
    }

    try {
      await axios.post(
        `/auth/resetPassword`,
        {
          userId: userData.id,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess(true);
      setShowChangePassword(false);
      setForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || '❌ Failed to change password.';
      setError({ show: true, message: msg });
    }
  };

  // Delete account
  const confirmDeleteAccount = () => {
    if (!userData?.id) return;

    fetch(`/auth/user/${userData.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete account');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      })
      .catch((err) => setError({ show: true, message: err.message }));
  };

  if (!userData) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h4 className="screen-headings">Profile</h4>
      </div>
      <p className="text-muted">You can manage profile from this section.</p>
      <hr />

      {/* Actions */}
      <div className="d-flex justify-content-end gap-2 mt-2">
        <button className="edit-icon" onClick={() => setShowEditModal(true)}>
          <SquarePen className="icon" /> Edit
        </button>
        <button className="form-open-buttons" onClick={() => setShowChangePassword(true)}>
          Change Password
        </button>
        {showChangePassword && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content card-custom-border shadow">
                {/* Header */}
                <div className="modal-header bg-primary text-white py-6">
                  <h5 className="modal-title m-0">Change Password</h5>
                  <button
                    type="button"
                    className="btn-close bg-white btn-close-white"
                    aria-label="Close"
                    onClick={() => setShowChangePassword(false)}
                  ></button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChangePassword();
                  }}
                >
                  <div className="modal-body p-3">
                    {/* Hierarchy Title */}
                    <div className="mb-2">
                      <label className="label-heading small">New Password</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="label-heading small">Confirm Password</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
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
                      onClick={() => setShowChangePassword(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <button className="delete-icon" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="icon" /> Delete Account
        </button>
      </div>

      {/* Profile Cards */}
      {/* Profile Display Card */}
      <Row>
        <Col md={8}>
          <Card className="mb-6 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: 60, height: 60, fontSize: 22 }}
                >
                  {userData.firstName?.charAt(0)}
                  {userData.secondName?.charAt(0)}
                </div>
                <div className="ms-3">
                  <h5 className="mb-0">
                    {userData.firstName} {userData.secondName}
                  </h5>
                  <span className="badge bg-light text-primary border border-primary mt-1 text-capitalize">
                    {userData.userRole}
                  </span>
                </div>
              </div>

              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    {/* <strong>Username:</strong> {userData.userName} */}

                    <label className="label-heading small">First Name </label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      readOnly
                      value={userData.firstName}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    {/* <strong>Username:</strong> {userData.userName} */}

                    <label className="label-heading small">Second Name </label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      readOnly
                      value={userData.secondName}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    {/* <strong>Username:</strong> {userData.userName} */}

                    <label className="label-heading">Username</label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      style={{ marginTop: '0.02rem' }}
                      readOnly
                      value={userData.userName}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    {/* <strong>Username:</strong> {userData.userName} */}

                    <label className="label-heading small">Email </label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      readOnly
                      value={userData.email}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    {/* <strong>Username:</strong> {userData.userName} */}

                    <label className="label-heading small">Phone Number </label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      readOnly
                      value={userData.number}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    {/* <strong>Username:</strong> {userData.userName} */}

                    <label className="label-heading small">Status </label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      readOnly
                      value={userData.status}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    {/* <strong>Username:</strong> {userData.userName} */}

                    <label className="label-heading small">Role </label>
                    <input
                      type="text"
                      className="dropdowns input-tight"
                      readOnly
                      value={userData.userRole}
                    />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* Edit Profile Modal */}
        <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="form-headings">Edit Profile</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Username</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        value={editForm.userName}
                        onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">First Name</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Second Name</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        value={editForm.secondName}
                        onChange={(e) => setEditForm({ ...editForm, secondName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Phone Number</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        value={editForm.number}
                        onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">User Role</label>
                      <CustomDropdown
                        options={[
                          { id: 'admin', title: 'Admin' },
                          { id: 'user', title: 'User' },
                        ]}
                        value={editForm.userRole}
                        onChange={(val) => setEditForm({ ...editForm, userRole: val })}
                      />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Status</label>

                      <CustomDropdown
                        options={[
                          { id: 'active', title: 'Active' },
                          { id: 'inactive', title: 'Inactive' },
                        ]}
                        value={editForm.status}
                        onChange={(val) => setEditForm({ ...editForm, status: val })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Chages
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <Col md={4}>
          <Card className="shadow-sm mt-1">
            <Card.Body>
              <h5 className="form-headings">🌐 Login Info</h5>
              <div className=" mb-2">
                <label className="label-heading small">IP </label>
                <input
                  type="text"
                  className="dropdowns input-tight"
                  readOnly
                  value={ip || 'Loading...'}
                />
              </div>

              <div className=" mb-2">
                {/* <strong>Username:</strong> {userData.userName} */}

                <label className="label-heading small">Location </label>
                <input
                  type="text"
                  className="dropdowns input-tight"
                  readOnly
                  value={location ? `${location.city}, ${location.country}` : 'Determining...'}
                />
              </div>

              <div className=" mb-2">
                {/* <strong>Username:</strong> {userData.userName} */}

                <label className="label-heading small">Organization </label>
                <input
                  type="text"
                  className="dropdowns input-tight"
                  readOnly
                  value={location ? location.org : 'Determining...'}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <SuccessModal
        show={success}
        onClose={() => setSuccess(false)}
        message="✅ Action completed successfully!"
      />
      <ErrorModal
        show={error.show}
        onClose={() => setError({ show: false, message: '' })}
        message={error.message}
      />
      <ConfirmModal
        show={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="⚠️ Are you sure you want to permanently delete your account?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Profile;
