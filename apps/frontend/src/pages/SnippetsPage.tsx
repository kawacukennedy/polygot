import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import SnippetsList from '../components/SnippetsList';

const SnippetsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Snippets</Typography>
        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/snippets/new">
          Create New Snippet
        </Button>
      </Box>
      <SnippetsList />
    </Box>
  );
};

export default SnippetsPage;