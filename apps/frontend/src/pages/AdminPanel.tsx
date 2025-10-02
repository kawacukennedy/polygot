import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import {
  getUsersAdmin,
  promoteUserAdmin,
  deactivateUserAdmin,
  deleteUserAdmin,
  getSnippetsAdmin,
  deleteSnippetAdmin,
  flagSnippetAdmin,
  getExecutionsAdmin,
  rerunExecutionAdmin,
  killExecutionAdmin,
  getSystemHealthMetrics,
} from '../services/api';
import { User } from '../types/User';
import { Snippet } from '../types/Snippet';
import { RecentExecution } from '../types/Home';
import { useNotification } from '../contexts/NotificationContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await getUsersAdmin();
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch users');
        showNotification(errorData.message || 'Failed to fetch users', 'error');
      }
    } catch (err) {
      setError('Network error while fetching users');
      showNotification('Network error while fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action: string, userId: string) => {
    let success = false;
    try {
      switch (action) {
        case 'promote':
          success = (await promoteUserAdmin(userId)).ok;
          break;
        case 'deactivate':
          success = (await deactivateUserAdmin(userId)).ok;
          break;
        case 'delete':
          success = (await deleteUserAdmin(userId)).ok;
          break;
        default:
          break;
      }
      if (success) {
        fetchUsers(); // Refresh list
        showNotification(`User ${userId} ${action}d successfully!`, 'success');
      } else {
        showNotification(`Failed to ${action} user ${userId}`, 'error');
      }
    } catch (err) {
      showNotification(`Network error during ${action} user ${userId}`, 'error');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => handleAction('promote', user.id)}>Promote</Button>
                <Button size="small" onClick={() => handleAction('deactivate', user.id)}>Deactivate</Button>
                <Button size="small" color="error" onClick={() => handleAction('delete', user.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const SnippetsTable = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await getSnippetsAdmin();
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
    fetchSnippets();
  }, []);

  const handleAction = async (action: string, snippetId: string) => {
    let success = false;
    try {
      switch (action) {
        case 'delete':
          success = (await deleteSnippetAdmin(snippetId)).ok;
          break;
        case 'flag':
          success = (await flagSnippetAdmin(snippetId)).ok;
          break;
        default:
          break;
      }
      if (success) {
        fetchSnippets(); // Refresh list
        showNotification(`Snippet ${snippetId} ${action}d successfully!`, 'success');
      } else {
        showNotification(`Failed to ${action} snippet ${snippetId}`, 'error');
      }
    } catch (err) {
      showNotification(`Network error during ${action} snippet ${snippetId}`, 'error');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Language</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {snippets.map((snippet) => (
            <TableRow key={snippet.id}>
              <TableCell>{snippet.id}</TableCell>
              <TableCell>{snippet.title}</TableCell>
              <TableCell>{snippet.language}</TableCell>
              <TableCell>{snippet.visibility}</TableCell>
              <TableCell>
                <Button size="small" color="error" onClick={() => handleAction('delete', snippet.id)}>Delete</Button>
                <Button size="small" onClick={() => handleAction('flag', snippet.id)}>Flag</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ExecutionsTable = () => {
  const [executions, setExecutions] = useState<RecentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchExecutions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await getExecutionsAdmin();
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

  useEffect(() => {
    fetchExecutions();
  }, []);

  const handleAction = async (action: string, executionId: string) => {
    let success = false;
    try {
      switch (action) {
        case 'rerun':
          success = (await rerunExecutionAdmin(executionId)).ok;
          break;
        case 'kill':
          success = (await killExecutionAdmin(executionId)).ok;
          break;
        default:
          break;
      }
      if (success) {
        fetchExecutions(); // Refresh list
        showNotification(`Execution ${executionId} ${action}d successfully!`, 'success');
      } else {
        showNotification(`Failed to ${action} execution ${executionId}`, 'error');
      }
    } catch (err) {
      showNotification(`Network error during ${action} execution ${executionId}`, 'error');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Snippet ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Runtime</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {executions.map((exec) => (
            <TableRow key={exec.id}>
              <TableCell>{exec.id}</TableCell>
              <TableCell>{exec.snippet_id}</TableCell>
              <TableCell>{exec.status}</TableCell>
              <TableCell>{exec.language}</TableCell>
              <TableCell>{exec.duration_ms}ms</TableCell>
              <TableCell>
                <Button size="small" onClick={() => handleAction('rerun', exec.id)}>Re-run</Button>
                <Button size="small" color="error" onClick={() => handleAction('kill', exec.id)}>Kill</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const SystemHealthMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await getSystemHealthMetrics();
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch system health metrics');
        showNotification(errorData.message || 'Failed to fetch system health metrics', 'error');
      }
    } catch (err) {
      setError('Network error while fetching system health metrics');
      showNotification('Network error while fetching system health metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>System Health</Typography>
      {metrics ? (
        <Box>
          <Typography>Queue Depth: {metrics.queue_depth}</Typography>
          <Typography>API Latency: {metrics.api_latency}</Typography>
          <Typography>DB Replication Lag: {metrics.db_replication_lag}</Typography>
        </Box>
      ) : (
        <Typography>No metrics available.</Typography>
      )}
    </Paper>
  );
};

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Access Denied: You must be an administrator to view this page.</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="admin panel tabs">
            <Tab label="Users" {...a11yProps(0)} />
            <Tab label="Snippets" {...a11yProps(1)} />
            <Tab label="Executions" {...a11yProps(2)} />
            <Tab label="System Health" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <UsersTable />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SnippetsTable />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ExecutionsTable />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <SystemHealthMetrics />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default AdminPanel;