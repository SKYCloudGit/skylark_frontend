import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import { BASE_URL } from '../Services/api';

const ChangePassword = ({ show, onClose }) => {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [userId, setUserId] = useState(null); // will store keyCloakId
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  const getAuthToken = () => localStorage.getItem('authToken');

  // ✅ Fetch keyCloakId on mount
  useEffect(() => {
    if (!show) return; // fetch only when modal is opened

    const token = getAuthToken();
    if (!token) return;

    fetch(`/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then((data) => {
        setUserId(data.keycloakId);
      })
      .catch((err) => {
        console.error(err);
        setError({ show: true, message: '❌ Failed to fetch user ID.' });
      });
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ show: false, message: '' });

    const token = getAuthToken();
    if (!token || !userId) {
      setError({ show: true, message: '❌ Missing auth token or user ID.' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError({ show: true, message: '❌ Passwords do not match.' });
      return;
    }

    try {
      await axios.post(
        `/api/auth/resetPassword`,
        {
          userId: userId,
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
      setForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || '❌ Failed to change password.';
      setError({ show: true, message: msg });
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content card-custom-border shadow">
            {/* Header */}
            <div className="modal-header bg-primary text-white py-6">
              <h5 className="modal-title m-0">Change Password</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-3">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label className="label-heading small">New Password</label>
                    <input
                      type="password"
                      className="dropdowns input-tight"
                      required
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6 mb-2">
                    <label className="label-heading small">Confirm Password</label>
                    <input
                      type="password"
                      className="dropdowns input-tight"
                      required
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ minWidth: '100px' }}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success & Error Modals */}
      <SuccessModal
        show={success}
        onClose={() => {
          setSuccess(false);
          onClose();
        }}
        message="✅ Password updated successfully!"
      />
      <ErrorModal
        show={error.show}
        onClose={() => setError({ show: false, message: '' })}
        message={error.message}
      />
    </>
  );
};

export default ChangePassword;
