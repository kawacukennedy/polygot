import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/apiClient';
import { useToast } from '../contexts/ToastContext';

const CheckEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Check your email</h1>
      <p className="mb-4">We sent a verification link to your email address. Please check your email and click the link to activate your account.</p>
      <button
        onClick={async () => {
          // Assume email is in localStorage or something, but for now, placeholder
          try {
            await apiCall('/auth/resend-verification', {
              method: 'POST',
              body: JSON.stringify({ email: 'user@example.com' }) // TODO: get from context
            });
            addToast('Verification email resent!', 'success');
          } catch (error: any) {
            addToast('Failed to resend email', 'error');
          }
        }}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        Resend Email
      </button>
      <button
        onClick={() => navigate('/login')}
        className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Back to Login
      </button>
    </div>
  );
};

export default CheckEmailPage;