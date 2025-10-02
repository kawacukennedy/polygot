import React, { useState, useMemo } from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
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

// Import new pages
import SignupPage from './pages/Signup';
import LoginPage from './pages/LoginPage';

// Placeholder Components
const HomePage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Welcome to PolyglotCodeHub!</Typography>
    <Typography variant="body1">Write, Run, Share Code in Any Language</Typography>
    <Button variant="contained" color="primary" component={RouterLink} to="/snippets">
      Get Started
    </Button>
    <Button variant="outlined" color="secondary" sx={{ ml: 2 }}>
      Browse Snippets
    </Button>
  </Box>
);
const SnippetsPage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Snippets</Typography>
    <Typography variant="body1">List and manage your code snippets here.</Typography>
  </Box>
);
const LeaderboardPage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Leaderboard</Typography>
    <Typography variant="body1">See who's at the top!</Typography>
  </Box>
);
const ProfilePage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Profile</Typography>
    <Typography variant="body1">Manage your profile settings.</Typography>
  </Box>
);
const AdminPage = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Admin Panel</Typography>
    <Typography variant="body1">Manage users, snippets, and system health.</Typography>
  </Box>
);

const Header = ({ toggleTheme, mode, handleDrawerToggle }) => (
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        PolyglotCodeHub
      </Typography>
      <Button color="inherit" component={RouterLink} to="/">Home</Button>
      <Button color="inherit" component={RouterLink} to="/snippets">Snippets</Button>
      <Button color="inherit" component={RouterLink} to="/leaderboard">Leaderboard</Button>
      <Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
      <Button color="inherit" component={RouterLink} to="/signup">Sign Up</Button>
      <Button color="inherit" component={RouterLink} to="/login">Log In</Button>
      <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Toolbar>
  </AppBar>
);

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => (
  <Box
    component="nav"
    sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
    aria-label="mailbox folders"
  >
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
      }}
    >
      <Toolbar />
      <List>
        {['Dashboard', 'My Snippets', 'Executions', 'Analytics', 'Settings'].map((text) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
      }}
      open
    >
      <Toolbar />
      <List>
        {['Dashboard', 'My Snippets', 'Executions', 'Analytics', 'Settings'].map((text) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  </Box>
);

const Footer = () => (
  <AppBar position="static" color="primary" sx={{ top: 'auto', bottom: 0 }}>
    <Toolbar>
      <Typography variant="body2" color="inherit" sx={{ flexGrow: 1 }}>
        © {new Date().getFullYear()} PolyglotCodeHub
      </Typography>
      <Button color="inherit">Privacy</Button>
      <Button color="inherit">Terms</Button>
      <Button color="inherit">Contact</Button>
      <Button color="inherit" href="https://github.com/your-repo" target="_blank">GitHub</Button>
    </Toolbar>
  </AppBar>
);

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
            <Route path="/snippets" element={<SnippetsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
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
