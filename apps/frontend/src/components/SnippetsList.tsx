import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getSnippets, deleteSnippet } from '../services/api';
import { Snippet } from '../types/Snippet';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const SnippetsList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSnippets();
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch snippets');
        showNotification(errorData.message || 'Failed to fetch snippets', 'error');
      }
    } catch (err) {
      setError('Network error while fetching snippets');
      showNotification('Network error while fetching snippets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSnippets();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        const response = await deleteSnippet(id);
        if (response.ok) {
          fetchSnippets(); // Refresh the list
          showNotification('Snippet deleted successfully!', 'success');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to delete snippet');
          showNotification(errorData.message || 'Failed to delete snippet', 'error');
        }
      } catch (err) {
        setError('Network error while deleting snippet');
        showNotification('Network error while deleting snippet', 'error');
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/snippets/edit/${id}`);
  };

  const handleRun = (id: string) => {
    console.log(`Running snippet ${id}`);
    showNotification(`Running snippet ${id} (placeholder)`, 'info');
    // Implement run functionality later
  };

  if (!isAuthenticated) {
    return (
      <Alert severity="info">Please log in to view your snippets.</Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  if (snippets.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">📄 No snippets yet. Create one!</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/snippets/new')}>Create New Snippet</Button>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Filters Placeholder */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Filters (Placeholder)</Typography>
        {/* Implement Language, Visibility, SearchTitle filters here */}
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="snippets table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Visibility</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {snippets.map((snippet) => (
              <TableRow key={snippet.id}>
                <TableCell component="th" scope="row">
                  {snippet.title}
                </TableCell>
                <TableCell>{snippet.language}</TableCell>
                <TableCell>{snippet.visibility}</TableCell>
                <TableCell>{new Date(snippet.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" onClick={() => handleEdit(snippet.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDelete(snippet.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton aria-label="run" onClick={() => handleRun(snippet.id)}>
                    <PlayArrowIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination/Infinite Scroll Placeholder */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">Infinite Scroll (Placeholder)</Typography>
      </Box>
    </Box>
  );
};

export default SnippetsList;
