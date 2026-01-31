import { useEffect, useState } from 'react';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';

export const DeleteUserDialog = ({
  show,
  onClose,
  userId,
  fetchUsers,
  title = 'Confirm Delete',
  message = '',
  confirmText = 'Yes',
  cancelText = 'No',
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteUser = async () => {
    if (!user.keycloakId) {
      alert('Error: User Keycloak ID is missing!');
      return;
    }
    const token = getAuthToken();
    if (!token) return;
    try {
      setDeleting(true);
      const response = await fetch(`/auth/user/${user.keycloakId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(await response.text());

      if (response.ok) {
        if (onSuccess) onSuccess('User deleted successfully!');
        onClose();
      }
      if (fetchUsers) fetchUsers();
    } catch (error) {
      setError(true);
      setErrorMessage('Error updating role. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>

            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>Delete User {user.userName ? `: ${user.userName}` : ''}</p>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                {cancelText}
              </button>
              <button className="btn btn-danger" onClick={handleDeleteUser}>
                {confirmText}
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
        message="✅ USer deleted successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};
