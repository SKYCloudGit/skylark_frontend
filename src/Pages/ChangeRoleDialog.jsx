import { useEffect, useState } from 'react';
import { BASE_URL } from '../Services/api';
import CustomDropdown from '../Components/CustomDropdown';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';

export const ChangeRoleDialog = ({ show, onClose, userId, fetchUsers, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch user details when dialog opens
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
        setUser(data);
      } catch (err) {
        console.error(err);
        setError(true);
        setErrorMessage('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, show]);

  // Handle role change
  const handleChangeRole = async () => {
    if (!userId || !user.userRole) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/auth/user/modify/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userName: user.userName,
          userRole: user.userRole,
          status: user.status ?? 'active',
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      if (response.ok) {
        if (fetchUsers) await fetchUsers();
        if (onSuccess) onSuccess('User role updated successfully!');
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage('Error updating role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Parent Modal */}
      <div
        className="modal show d-block"
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="form-headings">Change Role for {user.userName || 'User'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="label-heading">Role</label>
                <CustomDropdown
                  options={[
                    { id: 'admin', title: 'Admin' },
                    { id: 'customer', title: 'Customer' },
                  ]}
                  value={user.userRole}
                  onChange={(selectedValue) => setUser({ ...user, userRole: selectedValue })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={onClose} disabled={saving}>
                Cancel
              </button>

              <button className="save-button" onClick={handleChangeRole} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success & Error Modals */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        message="✅ User role updated successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </>
  );
};
