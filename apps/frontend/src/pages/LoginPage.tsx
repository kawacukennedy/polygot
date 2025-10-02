import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Container, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', { // Assuming user service runs on port 3001
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login, e.g., store JWT token
        console.log('Login successful:', data);
        // For now, just redirect to home
        navigate('/');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Log In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Log In
          </Button>
          <Typography variant="body2" align="center">
            Don't have an account? {' '}
            <RouterLink to="/signup" style={{ textDecoration: 'none', color: 'inherit' }}>
              Sign Up
            </RouterLink>
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            <RouterLink to="/forgot-password" style={{ textDecoration: 'none', color: 'inherit' }}>
              Forgot password?
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;