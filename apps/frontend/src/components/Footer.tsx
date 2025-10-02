import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';

const Footer: React.FC = () => {
  return (
    <AppBar position="static" color="primary" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, py: { xs: 2, sm: 0 } }}>
        <Typography variant="body2" color="inherit" sx={{ flexGrow: 1, mb: { xs: 1, sm: 0 } }}>
          © {new Date().getFullYear()} PolyglotCodeHub
        </Typography>
        <Box>
          <Button color="inherit">Privacy</Button>
          <Button color="inherit">Terms</Button>
          <Button color="inherit">Contact</Button>
          <Button color="inherit" href="https://github.com/your-repo" target="_blank">GitHub</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;