import React from 'react';
import { Box, Typography } from '@mui/material';

const AnalyticsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics
      </Typography>
      <Typography variant="body1">
        This page will display analytics data.
      </Typography>
    </Box>
  );
};

export default AnalyticsPage;