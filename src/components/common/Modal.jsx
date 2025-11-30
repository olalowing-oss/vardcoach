import React, { useEffect, useCallback } from 'react';
import './Modal.css';

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  icon,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlay = true,
  footer,
}) {
  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div 
        className={`modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            {icon && <span className="modal-icon">{icon}</span>}
            <h2 id="modal-title" className="modal-title">{title}</h2>
          </div>
          {showCloseButton && (
            <button 
              className="modal-close"
              onClick={onClose}
              aria-label="Stäng"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Body */}
        <div className="modal-body">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalActions({ children, align = 'right' }) {
  return (
    <div className={`modal-actions modal-actions-${align}`}>
      {children}
    </div>
  );
}

export default Modal;
