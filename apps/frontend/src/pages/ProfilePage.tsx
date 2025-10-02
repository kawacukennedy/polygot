
import React, { useState, useEffect } from 'react';
import { fetchUser, updateUser, fetchUserSnippets } from '../services/api';
import { Link } from 'react-router-dom';

interface ProfilePageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ showNotification }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSnippets, setUserSnippets] = useState<any[]>([]);
  const [loadingSnippets, setLoadingSnippets] = useState(true);
  const [snippetsError, setSnippetsError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('session_token');
      const userId = localStorage.getItem('user_id'); // Assuming user_id is stored in localStorage

      if (!token || !userId) {
        setError('You are not logged in.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchUser(userId, token);
        if (data.status === 'error') {
          setError(data.message);
        } else {
          setName(data.name);
          setEmail(data.email);
          setBio(data.bio);
          setAvatarPreview(data.avatar_url);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const getSnippets = async () => {
      setLoadingSnippets(true);
      setSnippetsError(null);
      const token = localStorage.getItem('session_token');
      const userId = localStorage.getItem('user_id');

      if (!token || !userId) {
        setSnippetsError('You are not logged in.');
        setLoadingSnippets(false);
        return;
      }

      try {
        const data = await fetchUserSnippets(userId, token);
        if (data.status === 'error') {
          setSnippetsError(data.message);
        } else {
          setUserSnippets(data);
        }
      } catch (err: any) {
        setSnippetsError(err.message || 'An unexpected error occurred while fetching snippets.');
      } finally {
        setLoadingSnippets(false);
      }
    };

    getSnippets();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('File size exceeds 5MB', 'error');
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    const token = localStorage.getItem('session_token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      showNotification('You are not logged in.', 'error');
      return;
    }

    try {
      const userData = { name, bio };
      const data = await updateUser(userId, userData, token);

      if (data.status === 'error') {
        showNotification(data.message, 'error');
      } else {
        showNotification('Profile updated successfully!', 'success');
      }

      if (newPassword) {
        // TODO: Implement password change logic
        console.log('Password update is not yet implemented.');
      }
    } catch (err: any) {
      showNotification(err.message || 'An unexpected error occurred.', 'error');
    }
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-300 dark:bg-gray-700 rounded-full mb-4 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500">Avatar</span>
            )}
          </div>
          <input type="file" id="avatarUpload" className="hidden" accept=".jpg,.png,.webp" onChange={handleAvatarChange} />
          <label htmlFor="avatarUpload" className="cursor-pointer px-4 py-2 bg-light-button_primary text-white rounded-md hover:bg-opacity-90">
            Upload New Avatar
          </label>
          <p className="text-xs text-light-text_secondary dark:text-dark-text_secondary mt-2">Max 5MB (jpg, png, webp)</p>
        </div>

        <div className="md:col-span-2 bg-light-background dark:bg-dark-background p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text_secondary dark:text-dark-text_secondary">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text_secondary dark:text-dark-text_secondary">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text_secondary dark:text-dark-text_secondary">Bio</label>
              <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800"></textarea>
            </div>
          </div>

          <hr className="my-6" />

          <h2 className="text-2xl font-bold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text_secondary dark:text-dark-text_secondary">New Password</label>
              <input type="password" placeholder="********" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text_secondary dark:text-dark-text_secondary">Confirm New Password</label>
              <input type="password" placeholder="********" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800" />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button onClick={handleSaveChanges} className="px-4 py-2 bg-light-button_primary text-white rounded-md hover:bg-opacity-90">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
