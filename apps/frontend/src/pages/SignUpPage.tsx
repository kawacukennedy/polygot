import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../services/apiClient';

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState(localStorage.getItem('unsaved_signup') ? JSON.parse(localStorage.getItem('unsaved_signup')!).username : '');
  const [email, setEmail] = useState(localStorage.getItem('unsaved_signup') ? JSON.parse(localStorage.getItem('unsaved_signup')!).email : '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    form: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [networkError, setNetworkError] = useState('');
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
        if (username.length < 3 || username.length > 20) {
          newErrors.username = 'Username must be between 3 and 20 characters.';
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
        if (password.length < 12) {
          newErrors.password = 'Password must be at least 12 characters long.';
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

  // Autosave
  useEffect(() => {
    const autosave = setInterval(() => {
      localStorage.setItem('unsaved_signup', JSON.stringify({ username, email }));
    }, 3000);

    return () => clearInterval(autosave);
  }, [username, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      try {
        await signup(username, email, password);
        // Analytics event
        console.log('signup_success', { user_id: 'mock', timestamp: new Date() });
        localStorage.removeItem('unsaved_signup');
        navigate('/check-email');
      } catch (error: any) {
        if (error.status === 400) {
          // Validation error - show inline on password
          setErrors({ ...errors, password: 'Weak password' });
        } else if (error.status === 409) {
          // Duplicate - assume email, show inline
          setErrors({ ...errors, email: 'Email is already registered' });
        } else {
          // Network or other
          setNetworkError('Network error - please try again');
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
            placeholder="letters, numbers, underscore"
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
            placeholder="at least 12 chars"
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
      {networkError && (
        <div className="mb-4 p-3 bg-danger-light border border-danger rounded-md">
          <p className="text-danger">{networkError}</p>
          <button
            onClick={() => setNetworkError('')}
            className="mt-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary-hover"
          >
            Retry
          </button>
        </div>
      )}
      <p className="text-xs text-muted mt-3" style={{ fontSize: '13px' }}>
        By creating an account you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
};

export default SignUpPage;
