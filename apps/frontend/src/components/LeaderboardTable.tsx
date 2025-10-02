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
  CircularProgress,
  Alert,
} from '@mui/material';
import { getTopUsers } from '../services/api';
import { LeaderboardEntry } from '../types/Leaderboard';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const LeaderboardTable: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTopUsers();
      if (response.ok) {
        const data = await response.json();
        const mappedData: LeaderboardEntry[] = data.map((item: any, index: number) => ({
          rank: index + 1,
          user: item.user.name || 'N/A',
          score: item.score || 0,
          language: item.language || 'N/A',
          snippetsShared: item.snippetsShared || 0,
        }));
        setLeaderboard(mappedData);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch leaderboard');
        showNotification(errorData.message || 'Failed to fetch leaderboard', 'error');
      }
    } catch (err) {
      setError('Network error while fetching leaderboard');
      showNotification('Network error while fetching leaderboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboard();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Alert severity="info">Please log in to view the leaderboard.</Alert>
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

  return (
    <Box>
      {/* Filters and Sorting Placeholder */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Filters & Sorting (Placeholder)</Typography>
        {/* Implement language and time_period filters, and sorting options here */}
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="leaderboard table">
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell>Language</TableCell>
              <TableCell align="right">Snippets Shared</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.rank}>
                <TableCell component="th" scope="row">
                  {entry.rank}
                </TableCell>
                <TableCell>{entry.user}</TableCell>
                <TableCell align="right">{entry.score}</TableCell>
                <TableCell>{entry.language}</TableCell>
                <TableCell align="right">{entry.snippetsShared}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeaderboardTable;
