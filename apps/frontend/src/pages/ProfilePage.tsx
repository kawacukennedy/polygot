import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Modal from '../components/Modal'; // Assuming a generic Modal component exists

const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    form: '',
  });

  useEffect(() => {
    // Fetch user profile data
    setTimeout(() => {
      setDisplayName('Test User');
      setBio('This is a test bio.');
      setEmail('test@example.com');
      setLoading(false);
    }, 1000);
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle avatar upload logic
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation logic here
    if (newPassword !== confirmNewPassword) {
      setPasswordErrors({ ...passwordErrors, confirmNewPassword: 'Passwords do not match' });
      return;
    }
    // Add API call here
    alert('Password changed successfully!');
    setIsPasswordModalOpen(false);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-surface rounded-lg p-6 text-center">
            <img
              src="https://i.pravatar.cc/160"
              alt="Avatar"
              className="w-40 h-40 rounded-full mx-auto mb-4"
            />
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
            >
              Upload Avatar
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-surface rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-muted mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="bio" className="block text-sm font-medium text-muted mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                rows={4}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="w-full h-11 px-3 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-primary hover:underline"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 text-right">
        <button className="bg-success text-white font-bold py-2 px-4 rounded-md hover:bg-green-700">
          Save Changes
        </button>
      </div>

      {isPasswordModalOpen && (
        <Modal>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-muted mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md"
                />
                {passwordErrors.confirmNewPassword && <p className="text-danger text-xs mt-1">{passwordErrors.confirmNewPassword}</p>}
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-muted hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage;
