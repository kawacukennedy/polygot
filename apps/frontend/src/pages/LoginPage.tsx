import React, { useState } from 'react';
import { login } from '../services/api';
import { trackLoginSuccess, trackLoginFailure } from '../services/analytics';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

type UIState = 'idle' | 'validating' | 'success' | 'error';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [uiState, setUiState] = useState<UIState>('idle');
  const [generalError, setGeneralError] = useState<string>('');

  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
    if (email.length > 254) return 'Email is too long';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      return `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setUiState('validating');

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      setUiState('error');
      return;
    }

    try {
      const response = await login(email, password);
      if (response.status === 'ok') {
        setUiState('success');
        trackLoginSuccess(response.user_id, 'web', '127.0.0.1', 0); // Placeholder for device, IP, latency
        localStorage.setItem('session_token', response.session_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        alert('Login successful!');
        window.location.href = '/dashboard'; // Redirect to dashboard or home page
      } else {
        setGeneralError(response.message || 'An unknown error occurred.');
        setUiState('error');
        trackLoginFailure(email, '127.0.0.1', response.error_code || 'UNKNOWN_ERROR');
      }
    } catch (error: any) {
      setGeneralError(error.message || 'Network error. Please try again.');
      setUiState('error');
      trackLoginFailure(email, '127.0.0.1', 'NETWORK_ERROR');
    }
  };

  const inputClass = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";
  const errorClass = "text-red-500 text-xs italic";
  const buttonClass = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className={`${inputClass} ${emailError ? 'border-red-500' : ''}`}
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
                setGeneralError('');
              }}
              onBlur={() => setEmailError(validateEmail(email))}
              aria-label="Email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && <p id="email-error" className={errorClass}>{emailError}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className={`${inputClass} ${passwordError ? 'border-red-500' : ''}`}
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
                setGeneralError('');
              }}
              onBlur={() => setPasswordError(validatePassword(password))}
              aria-label="Password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            {passwordError && <p id="password-error" className={errorClass}>{passwordError}</p>}
          </div>
          {generalError && <p className={`${errorClass} text-center`}>{generalError}</p>}
          <button
            type="submit"
            className={`${buttonClass} w-full`}
            disabled={uiState === 'validating'}
            aria-live="polite"
          >
            {uiState === 'validating' ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {uiState === 'success' && (
          <p className="text-green-500 text-center mt-4">Login successful!</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
