import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import { getRecentExecutions } from '../services/api';
import { RecentExecution } from '../types/Home';
import { useNotification } from '../contexts/NotificationContext';

const ExecutionsPage: React.FC = () => {
  const [executions, setExecutions] = useState<RecentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchExecutions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getRecentExecutions(); // Default limit is 10
        if (response.ok) {
          const data = await response.json();
          setExecutions(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch executions');
          showNotification(errorData.message || 'Failed to fetch executions', 'error');
        }
      } catch (err) {
        setError('Network error while fetching executions');
        showNotification('Network error while fetching executions', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchExecutions();
  }, []);

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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Recent Executions
      </Typography>
      {executions.length === 0 ? (
        <Typography variant="body1">No recent executions found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="executions table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Snippet ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Language</TableCell>
                <TableCell align="right">Duration (ms)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executions.map((exec) => (
                <TableRow key={exec.id}>
                  <TableCell>{exec.id}</TableCell>
                  <TableCell>{exec.snippet_id}</TableCell>
                  <TableCell>{exec.status}</TableCell>
                  <TableCell>{exec.language}</TableCell>
                  <TableCell align="right">{exec.duration_ms}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ExecutionsPage;