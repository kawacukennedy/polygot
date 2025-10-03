import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Alert,
  Avatar,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, changeUserPassword, uploadAvatar, getSnippets } from '../services/api';
import { Snippet } from '../types/Snippet';
import { User } from '../types/User';
import { useNotification } from '../contexts/NotificationContext';

interface AvatarUploadProps {
  userId: string;
  currentAvatar?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId, currentAvatar, onAvatarChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('File size exceeds 5MB limit.', 'error');
        setSelectedFile(null);
        setPreview(null);
        return;
      }
      const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedFormats.includes(file.type)) {
        showNotification('Only JPG, PNG, WEBP formats are allowed.', 'error');
        setSelectedFile(null);
        setPreview(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setUploading(true);
    try {
      const response = await uploadAvatar(userId, selectedFile);
      if (response.ok) {
        const data = await response.json();
        showNotification('Avatar uploaded successfully!', 'success');
        onAvatarChange(data.avatarUrl); // Update parent component with new avatar URL
        setSelectedFile(null);
        setPreview(null);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to upload avatar.', 'error');
      }
    } catch (err) {
      showNotification('Network error during avatar upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" gutterBottom>Profile Picture</Typography>
      <Avatar
        src={preview || currentAvatar || '/static/images/avatar/1.jpg'} // Default avatar
        sx={{ width: 100, height: 100, mb: 2 }}
      />
      <input
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        id="icon-button-file"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="icon-button-file">
        <IconButton color="primary" aria-label="upload picture" component="span">
          <PhotoCamera />
        </IconButton>
      </label>
      {selectedFile && (
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="body2">{selectedFile.name}</Typography>
          <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={handleUpload} disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

interface EditableFieldsProps {
  user: User | null;
  onFieldChange: (field: keyof User, value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const EditableFields: React.FC<EditableFieldsProps> = ({ user, onFieldChange, onSave, onCancel, loading }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>Profile Information</Typography>
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={user?.name || ''}
        onChange={(e) => onFieldChange('name', e.target.value)}
      />
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={user?.email || ''}
        onChange={(e) => onFieldChange('email', e.target.value)}
        disabled // Email is often not editable directly
      />
      <TextField
        label="Bio"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={user?.bio || ''}
        onChange={(e) => onFieldChange('bio', e.target.value)}
      />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

interface PasswordChangeProps {
  userId: string;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ userId }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasSpecialChar && hasUppercase && hasLowercase && hasNumber;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showNotification('All password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification('New password and confirmation do not match.', 'error');
      return;
    }
    if (!validatePassword(newPassword)) {
      showNotification('New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await changeUserPassword(userId, currentPassword, newPassword);
      if (response.ok) {
        showNotification('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to change password.', 'error');
      }
    } catch (err) {
      showNotification('Network error during password change.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>Change Password</Typography>
      <Paper sx={{ p: 2 }}>
        <TextField label="Current Password" type="password" fullWidth margin="normal" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <TextField label="New Password" type="password" fullWidth margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
          error={!!newPassword && !validatePassword(newPassword)}
          helperText={!!newPassword && !validatePassword(newPassword) ? 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char' : ''}
        />
        <TextField label="Confirm New Password" type="password" fullWidth margin="normal" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleChangePassword} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </Paper>
    </Box>
  );
};

interface UserSnippetsProps {
  userId: string;
}

const UserSnippets: React.FC<UserSnippetsProps> = ({ userId }) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchUserSnippets = async () => {
      setLoading(true);
      try {
        const response = await getSnippets({ userId: userId });
        if (response.ok) {
          const data = await response.json();
          setSnippets(data);
        } else {
          const errorData = await response.json();
          showNotification(errorData.message || 'Failed to fetch user snippets', 'error');
        }
      } catch (err) {
        showNotification('Network error while fetching user snippets', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchUserSnippets();
    }
  }, [userId]);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>My Snippets</Typography>
      <Paper sx={{ p: 2 }}>
        {snippets.length > 0 ? (
          <List> {/* Assuming List and ListItem are imported */}
            {snippets.map((snippet) => (
              <ListItem key={snippet.id}> {/* Assuming ListItem is imported */}
                <ListItemText primary={snippet.title} secondary={`${snippet.language} - ${snippet.visibility}`} /> {/* Assuming ListItemText is imported */}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">No snippets found.</Typography>
        )}
      </Paper>
    </Box>
  );
};

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  const [editableUser, setEditableUser] = useState<User | null>(user);
  const [loadingProfileSave, setLoadingProfileSave] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    setEditableUser(user);
  }, [user]);

  const handleFieldChange = (field: keyof User, value: string) => {
    setEditableUser((prev) => ({
      ...(prev as User),
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!editableUser || !user?.id) return;

    setLoadingProfileSave(true);
    try {
      const response = await updateUserProfile(user.id, editableUser.name, editableUser.email, editableUser.bio || '');
      if (response.ok) {
        const updatedUserData = await response.json();
        setUser(updatedUserData); // Update user in AuthContext
        showNotification('Profile updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Update failed.', 'error');
      }
    } catch (err) {
      showNotification('Network error during profile update.', 'error');
    } finally {
      setLoadingProfileSave(false);
    }
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatar: newAvatarUrl });
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>User Profile</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        {user?.id && <AvatarUpload userId={user.id} currentAvatar={user.avatar} onAvatarChange={handleAvatarChange} />}
        <EditableFields user={editableUser} onFieldChange={handleFieldChange} onSave={handleSaveProfile} loading={loadingProfileSave} />
        {user?.id && <PasswordChange userId={user.id} />}
      </Paper>
      {user?.id && <UserSnippets userId={user.id} />}
    </Container>
  );
};

export default ProfilePage;