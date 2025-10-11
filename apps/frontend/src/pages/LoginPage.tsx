import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../services/apiClient';
import Modal from '../components/Modal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
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
        const result = await login(email, password);
        if (result.twoFactorRequired) {
          setTempToken(result.tempToken);
          setShow2FAModal(true);
        } else {
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
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="text-sm text-red-500" role="alert">
                {errors.form}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
              </div>
              <Link to="/auth/forgot" className="text-sm underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={!isFormValid}>
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Enter 2FA Code</h2>
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="text-center text-lg"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {/* resend */}}>
              Resend
            </Button>
            <Button onClick={async () => {
              try {
                await apiCall('/auth/2fa/verify', {
                  method: 'POST',
                  body: JSON.stringify({ otp, tempToken })
                });
                setShow2FAModal(false);
                navigate('/dashboard');
              } catch (error) {
                // handle error
              }
            }}>
              Verify
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
