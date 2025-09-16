
import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000); // Notification disappears after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  let bgColor = 'bg-blue-500';
  if (type === 'success') {
    bgColor = 'bg-green-500';
  } else if (type === 'error') {
    bgColor = 'bg-red-500';
  }

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md text-white shadow-lg ${bgColor}`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={() => {
          setIsVisible(false);
          onClose();
        }} className="ml-4 font-bold">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
