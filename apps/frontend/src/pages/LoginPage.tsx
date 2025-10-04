import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
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
        await login(email, password);
        navigate('/dashboard');
      } catch (error) {
        setErrors({ ...errors, form: 'Invalid credentials' });
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit}>
        {errors.form && <p className="text-danger text-sm mb-4">{errors.form}</p>}
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
        <div className="flex items-center justify-between mb-4">
          <a href="/auth/forgot" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full h-11 bg-primary text-white font-bold rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-gray-400"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
