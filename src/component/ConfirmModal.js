import React from "react";
import "./ConfirmModal.css";

function ConfirmModal({ message, onConfirm, onCancel, show }) {
  if (!show) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="confirm-modal-message">{message}</div>
        <div className="confirm-modal-buttons">
          <button className="confirm-modal-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-modal-btn confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

