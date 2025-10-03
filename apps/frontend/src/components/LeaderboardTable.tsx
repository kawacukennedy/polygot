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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>('7d'); // Default to 7 days
  const [sortBy, setSortBy] = useState<string>('score_desc'); // Default sorting
  const { showNotification } = useNotification();

  const fetchLeaderboard = async (filters: { language?: string; timePeriod?: string; sortBy?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTopUsers(filters);
      if (response.ok) {
        const data = await response.json();
        // The API should ideally return ranked data, but for now, we map it.
        // If sortBy is 'rank_asc', the API should handle it, or we sort here.
        const mappedData: LeaderboardEntry[] = data.map((item: any, index: number) => ({
          rank: index + 1, // Assuming API returns data already sorted by score_desc
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
      fetchLeaderboard({ language: languageFilter, timePeriod: timePeriodFilter, sortBy: sortBy });
    }
  }, [isAuthenticated, languageFilter, timePeriodFilter, sortBy]);

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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="language-filter-label">Language</InputLabel>
            <Select
              labelId="language-filter-label"
              id="language-filter"
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
            <InputLabel id="time-period-filter-label">Time Period</InputLabel>
            <Select
              labelId="time-period-filter-label"
              id="time-period-filter"
              value={timePeriodFilter}
              label="Time Period"
              onChange={(e) => setTimePeriodFilter(e.target.value as string)}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value as string)}
            >
              <MenuItem value="score_desc">Score (High to Low)</MenuItem>
              <MenuItem value="rank_asc">Rank (Low to High)</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
