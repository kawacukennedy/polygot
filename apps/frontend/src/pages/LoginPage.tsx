import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const validateForm = () => {
      const newErrors = {
        email: '',
        password: '',
        form: '',
      };

      // Email validation
      if (email.length > 0 && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
        newErrors.email = 'Invalid email format.';
      }

      // Password validation
      if (password.length > 0 && password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long.';
      }

      setErrors(newErrors);
      setIsFormValid(
        Object.values(newErrors).every((error) => error === '') &&
        email.length > 0 &&
        password.length > 0
      );
    };

    validateForm();
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      try {
        const response = await login(email, password);
        if (response.requires2FA) {
          setShow2FAModal(true);
        } else {
          // Set cookies
          document.cookie = 'polyglot_access=token; httpOnly; secure; max-age=900';
          document.cookie = 'polyglot_refresh=refresh; httpOnly; secure; max-age=604800';
          navigate('/dashboard');
          // Analytics
          console.log('login_success', { user_id: 'mock', timestamp: new Date(), ip: 'mock', device: 'mock' });
        }
      } catch (error: any) {
        if (error.status === 401) {
          setErrors({ ...errors, form: 'Invalid credentials' });
        } else if (error.status === 423) {
          // Show locked modal
          alert('Account locked for 30 minutes');
        }
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6" style={{ maxWidth: '640px', padding: '24px' }}>
      <form onSubmit={handleSubmit} role="form">
        <div aria-live="polite"></div>
        {errors.form && <p className="text-danger text-sm mb-4" aria-live="assertive">{errors.form}</p>}
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
            tabIndex={1}
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
            tabIndex={2}
            className={`w-full px-3 bg-surface border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-danger' : 'border-gray-300'} focus:ring-focus-ring`}
            style={{ height: '44px' }}
          />
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
        </div>
        <div className="flex items-center justify-between mb-4">
          <a href="/auth/forgot" className="text-sm text-primary hover:underline" tabIndex={4}>
            Forgot password?
          </a>
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          tabIndex={3}
          className="w-full bg-primary text-white font-bold rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-gray-400"
          style={{ height: '44px' }}
        >
          Login
        </button>
      </form>

      <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)}>
        <h2>Enter 2FA Code</h2>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          maxLength={6}
          className="w-full h-11 px-3 border rounded"
          tabIndex={5}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {/* resend */}}
            className="mr-2 px-4 py-2 bg-primary text-white rounded"
            tabIndex={6}
          >
            Resend
          </button>
          <button
            onClick={() => { /* verify otp */ setShow2FAModal(false); navigate('/dashboard'); }}
            className="px-4 py-2 bg-primary text-white rounded"
            tabIndex={7}
          >
            Verify
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
