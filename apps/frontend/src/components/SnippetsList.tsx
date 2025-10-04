import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getSnippets, deleteSnippet } from '../services/api';
import { Snippet } from '../types/Snippet';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { io } from 'socket.io-client';

const SnippetsList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('');
  const [searchTitleFilter, setSearchTitleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const SNIPPETS_PER_PAGE = 20; // Defined in app_spec

  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = io('http://localhost:3003'); // Assuming execution service WebSocket URL

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket for snippets');
      });

      socketRef.current.on('snippet_created', (newSnippet: Snippet) => {
        showNotification(`New snippet created: ${newSnippet.title}`, 'info');
        setSnippets((prev) => [newSnippet, ...prev]);
      });

      socketRef.current.on('snippet_updated', (updatedSnippet: Snippet) => {
        showNotification(`Snippet updated: ${updatedSnippet.title}`, 'info');
        setSnippets((prev) =>
          prev.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s))
        );
      });

      socketRef.current.on('snippet_deleted', (deletedSnippetId: string) => {
        showNotification(`Snippet deleted: ${deletedSnippetId}`, 'info');
        setSnippets((prev) => prev.filter((s) => s.id !== deletedSnippetId));
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket for snippets');
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isAuthenticated, showNotification]);

  const observer = useRef<IntersectionObserver>();
  const lastSnippetElementRef = useCallback((node: HTMLTableRowElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchSnippets = async (filters: { language?: string; visibility?: string; searchTitle?: string }, pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const response = await getSnippets({
        ...filters,
        page: pageNum,
        pageSize: SNIPPETS_PER_PAGE,
      });
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setSnippets((prevSnippets) => [...prevSnippets, ...data]);
        } else {
          setSnippets(data);
        }
        setHasMore(data.length === SNIPPETS_PER_PAGE);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch snippets');
        showNotification(errorData.message || 'Failed to fetch snippets', 'error');
      }
    } catch (err) {
      setError('Network error while fetching snippets');
      showNotification('Network error while fetching snippets', 'error');
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setPage(1);
      setSnippets([]); // Clear snippets when filters change
      setHasMore(true);
      fetchSnippets({ language: languageFilter, visibility: visibilityFilter, searchTitle: searchTitleFilter }, 1);
    }
  }, [isAuthenticated, languageFilter, visibilityFilter, searchTitleFilter]);

  useEffect(() => {
    if (page > 1) {
      fetchSnippets({ language: languageFilter, visibility: visibilityFilter, searchTitle: searchTitleFilter }, page, true);
    }
  }, [page]);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        const response = await deleteSnippet(id);
        if (response.ok) {
          // No need to refetch, WebSocket will handle update
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
  }, [showNotification]);

  const handleEdit = useCallback((id: string) => {
    navigate(`/snippets/edit/${id}`);
  }, [navigate]);

  const handleRun = useCallback((id: string) => {
    console.log(`Running snippet ${id}`);
    showNotification(`Running snippet ${id} (placeholder)`, 'info');
    // Implement run functionality later
  }, [showNotification]);

  if (!isAuthenticated) {
    return (
      <Alert severity="info">Please log in to view your snippets.</Alert>
    );
  }

  if (loading && snippets.length === 0) {
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

  if (snippets.length === 0 && !loading) {
    return (
      <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">📄 No snippets yet. Create one!</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/snippets/new')}>Create New Snippet</Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={languageFilter}
              label="Language"
              onChange={(e) => setLanguageFilter(e.target.value as string)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
              <MenuItem value="go">Go</MenuItem>
              <MenuItem value="rust">Rust</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="visibility-select-label">Visibility</InputLabel>
            <Select
              labelId="visibility-select-label"
              id="visibility-select"
              value={visibilityFilter}
              label="Visibility"
              onChange={(e) => setVisibilityFilter(e.target.value as string)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Search Title"
            variant="outlined"
            value={searchTitleFilter}
            onChange={(e) => setSearchTitleFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Box>
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
            {snippets.map((snippet, index) => {
              if (snippets.length === index + 1) {
                return (
                  <TableRow ref={lastSnippetElementRef} key={snippet.id}>
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
                );
              } else {
                return (
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
                );
              }
            })}
            {loadingMore && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!hasMore && snippets.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary">No more snippets to load.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default SnippetsList;
