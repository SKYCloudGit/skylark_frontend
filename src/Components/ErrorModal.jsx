import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorModal = ({ show, onClose, message = 'An unexpected error occurred.' }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-danger">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Error</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <p className="text-danger m-0">{message}</p>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-danger" onClick={() => navigate('/')}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
