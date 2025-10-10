import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../services/apiClient';
import { useToast } from '../contexts/ToastContext';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    form: ''
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      addToast('Invalid reset link', 'error');
      navigate('/login');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate, addToast]);

  const validateForm = () => {
    const newErrors = {
      password: '',
      confirmPassword: '',
      form: ''
    };

    if (password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters long.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number and special character.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    setLoading(true);
    try {
      await apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      });

      addToast('Password reset successfully! You can now log in with your new password.', 'success');
      navigate('/login');
    } catch (error: any) {
      setErrors({ ...errors, form: error.message || 'Failed to reset password' });
      addToast('Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter new password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;