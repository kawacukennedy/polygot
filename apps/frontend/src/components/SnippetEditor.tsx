import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createSnippet, getSnippetById, updateSnippet, executeCode } from '../services/api';
import { Snippet } from '../types/Snippet';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { useNotification } from '../contexts/NotificationContext';

const languages = ['python', 'javascript', 'cpp', 'java', 'go', 'php', 'rust', 'ruby'];
const visibilities = ['public', 'private'];

const SnippetEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState(languages[0]);
  const [code, setCode] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [openExecutionDialog, setOpenExecutionDialog] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [realtimeLog, setRealtimeLog] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const socketRef = useRef<any>(null);
  const initialSnippetRef = useRef<Snippet | null>(null);

  // Autosave effect
  useEffect(() => {
    if (!isAuthenticated || !isDirty || loading || executing) return;

    const autoSaveTimer = setTimeout(() => {
      console.log('Autosaving snippet...');
      handleSubmit(); // Call save function
    }, 5000); // Autosave every 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [title, language, code, visibility, isDirty, isAuthenticated, loading, executing]);

  // Mark as dirty on change
  const handleChange = useCallback((setter: React.Dispatch<React.SetStateAction<string | 'public' | 'private'>>) => (value: string | 'public' | 'private') => {
    setter(value);
    setIsDirty(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketRef.current = io('http://localhost:3003');

      socketRef.current.on('connect', () => {
        console.log('Connected to execution service WebSocket');
      });

      socketRef.current.on('execution_status', (data: any) => {
        console.log('Real-time execution status:', data);
        if (data.userId === user.id) {
          setRealtimeLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Status: ${data.status}, Language: ${data.language}, Message: ${data.error || data.output || ''}`]);
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'killed') {
            setExecuting(false);
            setExecutionResult(data.output || '');
            setExecutionError(data.error || null);
          }
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from execution service WebSocket');
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (id && isAuthenticated) {
      const fetchSnippet = async () => {
        setLoading(true);
        try {
          const response = await getSnippetById(id);
          if (response.ok) {
            const data: Snippet = await response.json();
            setTitle(data.title);
            setLanguage(data.language);
            setCode(data.code);
            setVisibility(data.visibility);
            initialSnippetRef.current = data;
            setIsDirty(false);
          } else {
            showNotification('Failed to load snippet.', 'error');
          }
        } catch (err) {
          showNotification('Network error while fetching snippet.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSnippet();
    }
  }, [id, isAuthenticated]);

  const validateForm = () => {
    if (title.length < 3 || title.length > 100) {
      showNotification('Title must be between 3 and 100 characters.', 'error');
      return false;
    }
    if (code.length < 1 || code.length > 10000) {
      showNotification('Code must be between 1 and 10000 characters.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      if (id) {
        response = await updateSnippet(id, title, language, code, visibility);
      } else {
        response = await createSnippet(title, language, code, visibility);
      }

      if (response.ok) {
        showNotification(`Snippet ${id ? 'updated' : 'created'} successfully!`, 'success');
        setIsDirty(false);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || `Failed to ${id ? 'update' : 'create'} snippet.`, 'error');
      }
    } catch (err) {
      showNotification(`Network error while ${id ? 'updating' : 'creating'} snippet.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    setRealtimeLog([]);
    setOpenExecutionDialog(true);

    try {
      const response = await executeCode(language, code);
      if (response.ok) {
        const data = await response.json();
        setExecutionResult(data.output || 'Execution started...');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Code execution failed.', 'error');
        setExecutionError(errorData.message || 'Code execution failed.');
        setExecuting(false);
      }
    } catch (err) {
      showNotification('Network error during code execution.', 'error');
      setExecutionError('Network error during code execution.');
      setExecuting(false);
    }
  };

  const handleShare = () => {
    showNotification('Share functionality (placeholder).', 'info');
  };

  const handleCloseExecutionDialog = () => {
    setOpenExecutionDialog(false);
    setExecutionResult(null);
    setExecutionError(null);
    setRealtimeLog([]);
  };

  if (!isAuthenticated) {
    return (
      <Alert severity="info">Please log in to create or edit snippets.</Alert>
    );
  }

  if (loading && id) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Loading snippet...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{id ? 'Edit Snippet' : 'Create New Snippet'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => handleChange(setTitle)(e.target.value)}
          error={title.length > 0 && (title.length < 3 || title.length > 100)}
          helperText={title.length > 0 && (title.length < 3 || title.length > 100) ? 'Title must be between 3 and 100 characters' : ''}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            label="Language"
            onChange={(e) => handleChange(setLanguage)(e.target.value as string)}
          >
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>{lang}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="visibility-select-label">Visibility</InputLabel>
          <Select
            labelId="visibility-select-label"
            id="visibility-select"
            value={visibility}
            label="Visibility"
            onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
          >
            {visibilities.map((vis) => (
              <MenuItem key={vis} value={vis}>{vis}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ height: 400, my: 2, border: '1px solid #ccc' }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => handleChange(setCode)(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={handleRun} disabled={loading || executing}>
            {executing ? <CircularProgress size={24} /> : 'Run'}
          </Button>
          <Button variant="outlined" onClick={handleShare} disabled={loading}>
            Share
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !isDirty}>
            {id ? 'Update Snippet' : 'Save Snippet'}
          </Button>
        </Box>
      </Paper>

      <Dialog open={openExecutionDialog} onClose={handleCloseExecutionDialog} maxWidth="md" fullWidth>
        <DialogTitle>Code Execution Result</DialogTitle>
        <DialogContent>
          {executing ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={100}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Executing code...</Typography>
            </Box>
          ) : executionError ? (
            <Alert severity="error">{executionError}</Alert>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={10}
              value={executionResult || 'No output.'}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          )}
          {realtimeLog.length > 0 && (
            <Box sx={{ mt: 2, maxHeight: 200, overflowY: 'auto', border: '1px solid #eee', p: 1 }}>
              <Typography variant="subtitle2">Real-time Log:</Typography>
              {realtimeLog.map((log, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>{log}</Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExecutionDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SnippetEditor;