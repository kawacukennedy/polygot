
import React, { useState, useEffect, useCallback } from 'react';
import { fetchUser, updateUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ showNotification }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const navigate = useNavigate();

  const userId = '123'; // Placeholder for logged-in user ID

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('session_token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const data = await fetchUser(userId, token);
      if (data.status === 'error') {
        setError(data.message);
      } else {
        setUser(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/g.test(password)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  };

  const handleSave = async () => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      showNotification('Authentication token not found. Please log in.', 'error');
      return;
    }

    let hasError = false;
    const userData: { name?: string; bio?: string; current_password?: string; new_password?: string } = {};

    if (name !== user.name) userData.name = name;
    if (bio !== user.bio) userData.bio = bio;

    if (newPassword) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        showNotification(passwordError, 'error');
        hasError = true;
      }
      if (newPassword !== confirmNewPassword) {
        showNotification('New password and confirmation do not match.', 'error');
        hasError = true;
      }
      if (!currentPassword) {
        showNotification('Current password is required to change password.', 'error');
        hasError = true;
      }
      if (!hasError) {
        userData.current_password = currentPassword;
        userData.new_password = newPassword;
      }
    }

    if (hasError) return;

    try {
      const data = await updateUser(userId, userData, token);
      if (data.status === 'error') {
        showNotification(data.message, 'error');
      } else {
        showNotification('Profile updated successfully!', 'success');
        setUser(data); // Update local user state with new data
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      showNotification(err.message || 'An unexpected error occurred.', 'error');
    }
  };

  const handleCancel = () => {
    // Revert changes to original user data
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    showNotification('Changes cancelled.', 'info');
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-light-background dark:bg-dark-background shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      {/* Avatar Upload */}
      <div className="mb-6 flex items-center">
        <img src="https://via.placeholder.com/100" alt="User Avatar" className="w-24 h-24 rounded-full mr-4 border-2 border-light-accent dark:border-dark-accent" />
        <div>
          <label htmlFor="avatar-upload" className="cursor-pointer bg-light-button_secondary dark:bg-dark-button_secondary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-200">
            Upload Avatar
          </label>
          <input id="avatar-upload" type="file" className="hidden" accept=".jpg,.png,.webp" />
          <p className="text-sm text-light-text_secondary dark:text-dark-text_secondary mt-1">Max 5MB, JPG, PNG, WEBP</p>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-light-text_primary dark:text-dark-text_primary">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-light-background dark:bg-dark-background text-light-text_primary dark:text-dark-text_primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text_primary dark:text-dark-text_primary">Email</label>
          <input type="email" value={email} disabled className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-light-text_secondary dark:text-dark-text_secondary cursor-not-allowed" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-light-text_primary dark:text-dark-text_primary">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-light-background dark:bg-dark-background text-light-text_primary dark:text-dark-text_primary"></textarea>
        </div>
      </div>

      {/* Password Change */}
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-light-text_primary dark:text-dark-text_primary">Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-light-background dark:bg-dark-background text-light-text_primary dark:text-dark-text_primary" />
        </div>
        <div></div> {/* Empty div for spacing */}
        <div>
          <label className="block text-sm font-medium text-light-text_primary dark:text-dark-text_primary">New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-light-background dark:bg-dark-background text-light-text_primary dark:text-dark-text_primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text_primary dark:text-dark-text_primary">Confirm New Password</label>
          <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-light-background dark:bg-dark-background text-light-text_primary dark:text-dark-text_primary" />
        </div>
      </div>

      {/* User Snippets (Placeholder) */}
      <h2 className="text-2xl font-bold mb-4">My Snippets</h2>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-light-text_secondary dark:text-dark-text_secondary">
        <p>User snippets will be displayed here.</p>
        {/* Integration with fetchUserSnippets API and a SnippetsList component would go here */}
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md text-light-text_primary dark:text-dark-text_primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 bg-light-button_primary text-white rounded-md hover:bg-opacity-90 transition-opacity duration-200">Save</button>
      </div>
    </div>
  );
};

export default ProfilePage;
