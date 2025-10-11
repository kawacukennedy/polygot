import React, { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose, title, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus trap
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        ref={modalRef}
        className={`bg-surface rounded-lg p-6 z-10 w-full animate-modal-enter ${sizeClasses[size]}`}
        style={{ padding: '24px', borderRadius: '12px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <h2 id="modal-title" className="text-xl font-semibold mb-4">
            {title}
          </h2>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center focus:outline-none"
          style={{ width: '28px', height: '28px' }}
          tabIndex={1}
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
