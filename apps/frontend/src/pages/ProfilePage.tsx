import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://i.pravatar.cc/160');
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
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Fetch user profile data
    setTimeout(() => {
      setDisplayName('Test User');
      setBio('This is a test bio.');
      setEmail('test@example.com');
      setLoading(false);
    }, 1000);
  }, []);

  // Autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      if (displayName || bio) {
        // Autosave logic
        console.log('Autosaving profile');
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [displayName, bio]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('File too large', 'error');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast('Unsupported format', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/users/1/avatar', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
        addToast('Avatar uploaded successfully!', 'success');
      } else {
        addToast('Failed to upload avatar.', 'error');
      }
    } catch (error) {
      addToast('Network error while uploading avatar.', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio }),
      });
      if (response.ok) {
        addToast('Profile updated successfully!', 'success');
      } else {
        addToast('Failed to update profile.', 'error');
      }
    } catch (error) {
      addToast('Network error while saving profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      form: '',
    };

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
      valid = false;
    }
    if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long.';
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(newPassword)) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, number and special character.';
      valid = false;
    }
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match.';
      valid = false;
    }

    setPasswordErrors(newErrors);

    if (!valid) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.ok) {
        addToast('Password changed successfully!', 'success');
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const errorData = await response.json();
        newErrors.form = errorData.message || 'Failed to change password.';
        setPasswordErrors(newErrors);
      }
    } catch (error) {
      newErrors.form = 'Network error while changing password.';
      setPasswordErrors(newErrors);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarImage src={avatarUrl} alt="Avatar" />
              <AvatarFallback>TU</AvatarFallback>
            </Avatar>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploadingAvatar}
              accept="image/jpeg,image/png,image/webp"
            />
            <Button asChild disabled={isUploadingAvatar}>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
              </label>
            </Button>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={250}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
              />
            </div>
            <Button
              variant="link"
              className="p-0"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSavingProfile}>
          {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordErrors.form && (
              <p className="text-sm text-red-500">{passwordErrors.form}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={passwordErrors.currentPassword ? "border-red-500" : ""}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={passwordErrors.newPassword ? "border-red-500" : ""}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={passwordErrors.confirmNewPassword ? "border-red-500" : ""}
              />
              {passwordErrors.confirmNewPassword && (
                <p className="text-sm text-red-500">{passwordErrors.confirmNewPassword}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;