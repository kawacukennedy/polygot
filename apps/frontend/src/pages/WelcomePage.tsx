import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

const WelcomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { addToast } = useToast();

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/auth/resend-verification', {
        method: 'POST',
      });
      if (response.ok) {
        addToast('Verification email sent!', 'success');
      } else {
        addToast('Failed to send verification email.', 'error');
      }
    } catch (error) {
      addToast('Network error while sending verification email.', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
      <p className="text-lg text-muted">Thank you for signing up. Please verify your email address.</p>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Verify your email</h2>
          <p className="mb-4">We sent a verification link to your email. It will expire in 15 minutes.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleResendVerification}
              className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
            >
              Resend
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-muted text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WelcomePage;
