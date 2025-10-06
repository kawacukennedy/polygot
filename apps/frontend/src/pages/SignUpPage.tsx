import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiCall } from '../services/apiClient';
import Modal from '../components/Modal';

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    form: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const validateForm = async () => {
      const newErrors = {
        username: '',
        email: '',
        password: '',
        form: '',
      };

      // Username validation
      if (username.length > 0) {
        if (username.length < 3 || username.length > 30) {
          newErrors.username = 'Username must be between 3 and 30 characters.';
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          newErrors.username = 'Only letters, numbers and underscores allowed.';
        } else {
          // Async unique check
          try {
            const data = await apiCall<{ available: boolean }>('/users/check-username', {
              method: 'POST',
              body: JSON.stringify({ username }),
            });
            if (!data.available) {
              newErrors.username = 'Username is already taken.';
            }
          } catch (error: any) {
            // Handle network error or API error
            newErrors.username = error.message || 'Error checking username availability.';
          }
        }
      }

      // Email validation
      if (email.length > 0) {
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
          newErrors.email = 'Invalid email format.';
        } else {
          // Async unique check
          try {
            const data = await apiCall<{ available: boolean }>('/users/check-email', {
              method: 'POST',
              body: JSON.stringify({ email }),
            });
            if (!data.available) {
              newErrors.email = 'Email is already registered.';
            }
          } catch (error: any) {
            // Handle network error or API error
            newErrors.email = error.message || 'Error checking email availability.';
          }
        }
      }

      // Password validation
      if (password.length > 0) {
        if (password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long.';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) {
          newErrors.password = 'Password must include uppercase, lowercase, number and special character.';
        }
      }

      setErrors(newErrors);
      setIsFormValid(
        Object.values(newErrors).every((error) => error === '') &&
        username.length > 0 &&
        email.length > 0 &&
        password.length > 0
      );
    };

    const debounce = setTimeout(() => {
      validateForm();
    }, 300); // Debounce validation

    return () => clearTimeout(debounce);
  }, [username, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      try {
        await signup(username, email, password);
        // Analytics event
        console.log('signup_success', { user_id: 'mock', timestamp: new Date() });
        addToast('Account created! Check your email to verify', 'success');
        setShowVerificationModal(true);
      } catch (error: any) {
        if (error.status === 400) {
          // Validation error - show inline
          setErrors({ ...errors, form: 'Validation error - check fields' });
        } else if (error.status === 409) {
          // Duplicate
          setErrors({ ...errors, form: 'Username or email already exists' });
        } else {
          // Network or other
          addToast('Network error - please try again', 'error');
        }
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ maxWidth: '720px', padding: '24px' }}>
      <form onSubmit={handleSubmit} role="form">
        <div aria-live="polite" id="error_region"></div>
        {errors.form && <p className="text-danger text-sm mb-4" aria-live="assertive">{errors.form}</p>}
        <div className="mb-3">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-muted mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="choose-a-username"
            aria-label="username"
            tabIndex={1}
            className={`w-full px-3 bg-surface border rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'border-danger' : 'border-gray-300'} focus:ring-focus-ring`}
            style={{ height: '44px' }}
          />
          {errors.username && <p className="text-danger text-xs mt-1">{errors.username}</p>}
        </div>
        <div className="mb-3">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-muted mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="email"
            tabIndex={2}
            className={`w-full px-3 bg-surface border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-danger' : 'border-gray-300'} focus:ring-focus-ring`}
            style={{ height: '44px' }}
          />
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-muted mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-label="password"
            tabIndex={3}
            className={`w-full px-3 bg-surface border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-danger' : 'border-gray-300'} focus:ring-focus-ring`}
            style={{ height: '44px' }}
          />
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          tabIndex={4}
          className="w-full bg-primary text-white font-bold rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-gray-400"
          style={{ height: '44px', borderRadius: '8px' }}
        >
          Create account
        </button>
      </form>
      <p className="text-xs text-muted mt-3" style={{ fontSize: '13px' }}>
        By creating an account you agree to our Terms and Privacy Policy
      </p>

      <Modal isOpen={showVerificationModal} onClose={() => { setShowVerificationModal(false); navigate('/welcome'); }}>
        <h2 id="verify_headline">Verify your email</h2>
        <p>We sent a verification link to your email. It will expire in 15 minutes.</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {/* resend */}}
            className="mr-2 px-4 py-2 bg-primary text-white rounded"
            tabIndex={1}
          >
            Resend
          </button>
          <button
            onClick={() => { setShowVerificationModal(false); navigate('/welcome'); }}
            className="px-4 py-2 bg-gray-300 rounded"
            tabIndex={2}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SignUpPage;
