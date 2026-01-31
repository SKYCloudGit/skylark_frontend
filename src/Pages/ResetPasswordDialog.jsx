import { useEffect, useState } from 'react';
import { BASE_URL } from '../Services/api';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';

export const ResetPasswordDialog = ({
  show,
  onClose,
  userId,
  keycloakId,
  fetchUsers,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [user, setUser] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        const response = await fetch(`/api/auth/user/id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId, show]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Please enter both fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.keycloakId,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      if (response.ok) {
        if (onSuccess) onSuccess('User password updated successfully!');
        onClose();
      }
      if (fetchUsers) fetchUsers();
    } catch (error) {
      setError(true);
      setErrorMessage('Error updating role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="form-headings">Reset Password for {user.userName || 'User'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="label-heading">New Password</label>
              <input
                type="password"
                value={newPassword}
                className="dropdowns"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label-heading">Confirm Password</label>
              <input
                type="password"
                className="dropdowns"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="modal-footer py-2 d-flex justify-content-center gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                onClick={handleResetPassword}
              >
                Change
              </button>
              <button className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
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
        message="✅ Password updated successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};
