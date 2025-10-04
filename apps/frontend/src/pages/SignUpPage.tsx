import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

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
            const response = await fetch('/users/check-username', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username }),
            });
            const data = await response.json();
            if (!data.available) {
              newErrors.username = 'Username is already taken.';
            }
          } catch (error) {
            // Handle network error
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
            const response = await fetch('/users/check-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!data.available) {
              newErrors.email = 'Email is already registered.';
            }
          } catch (error) {
            // Handle network error
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
        // Mock analytics event
        console.log('signup_success', { timestamp: new Date() });
        addToast('Account created! Check your email to verify', 'success');
        navigate('/welcome');
      } catch (error: any) {
        setErrors({ ...errors, form: error.message || 'An unexpected error occurred. Please try again.' });
        addToast(error.message || 'An unexpected error occurred. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit}>
        {errors.form && <p className="text-danger text-sm mb-4">{errors.form}</p>}
        <div className="mb-4">
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
            className={`w-full h-11 px-3 bg-surface border rounded-md focus:outline-none focus:ring-2 ${errors.username ? 'border-danger' : 'border-gray-300'} focus:ring-focus-ring`}
          />
          {errors.username && <p className="text-danger text-xs mt-1">{errors.username}</p>}
        </div>
        <div className="mb-4">
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
            className={`w-full h-11 px-3 bg-surface border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-danger' : 'border-gray-300'} focus:ring-focus-ring`}
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
            className={`w-full h-11 px-3 bg-surface border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-danger' : 'border-gray-300'} focus:ring-focus-ring`}
          />
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full h-11 bg-primary text-white font-bold rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-gray-400"
        >
          Create account
        </button>
      </form>
      <p className="text-xs text-muted mt-3">
        By creating an account you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
};

export default SignUpPage;
