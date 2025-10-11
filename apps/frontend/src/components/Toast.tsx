import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    bg: 'bg-success',
    icon: '✓',
  },
  error: {
    bg: 'bg-danger',
    icon: '✕',
  },
  info: {
    bg: 'bg-primary',
    icon: 'ℹ',
  },
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000); // Auto-close after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  const { bg, icon } = toastConfig[type];

  return (
    <div
      className={`w-96 p-3 rounded-lg shadow-lg flex items-center text-white ${bg} animate-fade-slide-in`}
      style={{ width: '360px', padding: '12px', borderRadius: '8px' }}
      role="alert"
      aria-live="polite"
    >
      <span className="mr-3 text-xl">{icon}</span>
      <p>{message}</p>
      <button onClick={() => onClose(id)} className="ml-auto text-white focus:outline-none" aria-label="Close toast">
        ✕
      </button>
    </div>
  );
};

export default Toast;
