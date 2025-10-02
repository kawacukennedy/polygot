import React from 'react';
import { Box, Typography } from '@mui/material';
import LeaderboardTable from '../components/LeaderboardTable';

const LeaderboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Leaderboard</Typography>
      <LeaderboardTable />
    </Box>
  );
};

export default LeaderboardPage;