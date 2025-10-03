import React, { useState, useMemo } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AddIcon from '@mui/icons-material/Add';

// Import new pages
import SignupPage from './pages/Signup';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import HomePage from './pages/Home';
import SnippetsPage from './pages/SnippetsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ExecutionsPage from './pages/ExecutionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Import components
import SnippetEditor from './components/SnippetEditor';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Import AuthContext
import { useAuth } from './contexts/AuthContext';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#6200EE' },
                secondary: { main: '#03DAC6' },
                background: { default: '#FFFFFF', paper: '#FFFFFF' },
                text: { primary: '#000000', secondary: '#4B4B4B' },
              }
            : {
                primary: { main: '#BB86FC' },
                secondary: { main: '#03DAC6' },
                background: { default: '#121212', paper: '#121212' },
                text: { primary: '#E0E0E0', secondary: '#B0B0B0' },
              }),
        },
        transitions: {
          // Define custom transitions for theme changes
          create: (props, options) => {
            return createTheme().transitions.create(props, {
              duration: 300, // 300ms
              easing: 'ease-in-out',
              ...options,
            });
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header toggleTheme={toggleTheme} mode={mode} handleDrawerToggle={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: `240px` },
            mt: '64px', // AppBar height
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/snippets" element={<SnippetsPage />} />
            <Route path="/my-snippets" element={<SnippetsPage />} />
            <Route path="/snippets/new" element={<SnippetEditor mode={mode} />} />
            <Route path="/snippets/edit/:id" element={<SnippetEditor mode={mode} />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/executions" element={<ExecutionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Box>
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
