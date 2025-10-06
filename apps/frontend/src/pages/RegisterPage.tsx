import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import { signupUser } from '../services/api';

interface RegisterPageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,72}$/;

const RegisterPage: React.FC<RegisterPageProps> = ({ showNotification }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value: string) => {
    if (!value) return t('email_required');
    if (!EMAIL_REGEX.test(value)) return t('invalid_email_format');
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value) return t('password_required');
    if (!PASSWORD_REGEX.test(value)) return t('password_strength_requirements');
    return null;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return t('confirm_password_required');
    if (value !== password) return t('passwords_do_not_match');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setLoading(true);

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(confirmPassword);

    if (emailValidation) setEmailError(emailValidation);
    if (passwordValidation) setPasswordError(passwordValidation);
    if (confirmPasswordValidation) setConfirmPasswordError(confirmPasswordValidation);

    if (emailValidation || passwordValidation || confirmPasswordValidation) {
      setLoading(false);
      return;
    }

    try {
      const response = await signupUser(email, email, password) as any;

      if (response.status === 'ok') {
        showNotification(t('registration_successful'), 'success');
        navigate('/login');
      } else {
        // Handle specific backend error codes
        if (response.error_code === 'EMAIL_ALREADY_EXISTS') {
          setEmailError(t('email_already_exists'));
        } else if (response.error_code === 'PASSWORD_MISMATCH') {
          setConfirmPasswordError(t('passwords_do_not_match'));
        } else if (response.error_code === 'VALIDATION_FAILED') {
          // Assuming backend sends field-specific validation errors
          if (response.field === 'email') setEmailError(response.message);
          else if (response.field === 'password') setPasswordError(response.message);
          else setGeneralError(response.message || t('registration_failed'));
        } else {
          setGeneralError(response.message || t('registration_failed'));
        }
        showNotification(response.message || t('registration_failed'), 'error');
      }
    } catch (err: any) {
      setGeneralError(err.message || t('unexpected_error'));
      showNotification(err.message || t('unexpected_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500";
  const errorClass = "text-red-500 text-xs italic mt-1";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">{t('register')}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium">{t('email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailError(validateEmail(email))}
              className={`${inputClass} ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {emailError && <p className={errorClass}>{emailError}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">{t('password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordError(validatePassword(password))}
              className={`${inputClass} ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {passwordError && <p className={errorClass}>{passwordError}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">{t('confirm_password')}</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordError(validateConfirmPassword(confirmPassword))}
              className={`${inputClass} ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {confirmPasswordError && <p className={errorClass}>{confirmPasswordError}</p>}
          </div>
          {generalError && <p className={`${errorClass} text-center`}>{generalError}</p>}
          <div>
            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700" disabled={loading}>
              {loading ? t('registering') : t('register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
