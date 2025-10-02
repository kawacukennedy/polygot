import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Fade,
  Slide,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getPopularLanguages, getRecentExecutions } from '../services/api';
import { PopularLanguage, RecentExecution } from '../types/Home';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [popularLanguages, setPopularLanguages] = useState<PopularLanguage[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingExecutions, setLoadingExecutions] = useState(true);
  const [errorLanguages, setErrorLanguages] = useState<string | null>(null);
  const [errorExecutions, setErrorExecutions] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [heroAnimationIn, setHeroAnimationIn] = useState(false);

  useEffect(() => {
    setHeroAnimationIn(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPopularLanguages = async () => {
        setLoadingLanguages(true);
        setErrorLanguages(null);
        try {
          const response = await getPopularLanguages();
          if (response.ok) {
            const data = await response.json();
            setPopularLanguages(data);
          } else {
            const errorData = await response.json();
            setErrorLanguages(errorData.message || 'Failed to fetch popular languages');
            showNotification(errorData.message || 'Failed to fetch popular languages', 'error');
          }
        } catch (err) {
          setErrorLanguages('Network error while fetching popular languages');
          showNotification('Network error while fetching popular languages', 'error');
        } finally {
          setLoadingLanguages(false);
        }
      };

      const fetchRecentExecutions = async () => {
        setLoadingExecutions(true);
        setErrorExecutions(null);
        try {
          const response = await getRecentExecutions();
          if (response.ok) {
            const data = await response.json();
            setRecentExecutions(data);
          } else {
            const errorData = await response.json();
            setErrorExecutions(errorData.message || 'Failed to fetch recent executions');
            showNotification(errorData.message || 'Failed to fetch recent executions', 'error');
          }
        } catch (err) {
          setErrorExecutions('Network error while fetching recent executions');
          showNotification('Network error while fetching recent executions', 'error');
        } finally {
          setLoadingExecutions(false);
        }
      };

      fetchPopularLanguages();
      fetchRecentExecutions();
    }
  }, [isAuthenticated]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Hero Section */}
      <Fade in={heroAnimationIn} timeout={1000}>
        <Slide direction="down" in={heroAnimationIn} timeout={1000}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'background.paper',
              borderRadius: 2,
              mb: 4,
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom>
              Write, Run, Share Code in Any Language
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Cross-language collaborative code snippet platform with execution, sharing, leaderboards, analytics, and gamification.
            </Typography>
            <Button variant="contained" color="primary" size="large" component={RouterLink} to="/snippets/new">
              Get Started
            </Button>
            <Button variant="outlined" color="secondary" size="large" sx={{ ml: 2 }} component={RouterLink} to="/snippets">
              Browse Snippets
            </Button>
          </Box>
        </Slide>
      </Fade>

      {/* Charts Section */}
      <Box sx={{ my: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Popular Languages</Typography>
        {loadingLanguages ? (
          <Box display="flex" justifyContent="center" mt={2}><CircularProgress /></Box>
        ) : errorLanguages ? (
          <Alert severity="error">{errorLanguages}</Alert>
        ) : (popularLanguages.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={popularLanguages}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="language" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Snippets Count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">No popular languages data available.</Typography>
        ))}
      </Box>

      {/* Recent Executions Section */}
      <Box sx={{ my: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Recent Executions</Typography>
        {loadingExecutions ? (
          <Box display="flex" justifyContent="center" mt={2}><CircularProgress /></Box>
        ) : errorExecutions ? (
          <Alert severity="error">{errorExecutions}</Alert>
        ) : (recentExecutions.length > 0 ? (
          <List>
            {recentExecutions.map((exec) => (
              <ListItem key={exec.id}>
                <ListItemText
                  primary={`Snippet: ${exec.snippet_id} - Language: ${exec.language} - Status: ${exec.status}`}
                  secondary={`Executed at: ${new Date(exec.executed_at).toLocaleString()} - Duration: ${exec.duration_ms}ms`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">No recent executions data available.</Typography>
        ))}
      </Box>
    </Box>
  );
};

export default HomePage;
