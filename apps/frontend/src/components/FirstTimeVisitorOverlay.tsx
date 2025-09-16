
import React, { useState, useEffect } from 'react';

interface FirstTimeVisitorOverlayProps {
  onClose: () => void;
}

const FirstTimeVisitorOverlay: React.FC<FirstTimeVisitorOverlayProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOverlay = localStorage.getItem('hasSeenFirstTimeVisitorOverlay');
    if (!hasSeenOverlay) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenFirstTimeVisitorOverlay', 'true');
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Polyglot Playground!</h2>
        <p className="text-gray-700 mb-6">
          Explore, contribute, and benchmark backend services across multiple programming languages in a fully adaptive, gamified environment.
        </p>
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default FirstTimeVisitorOverlay;
