import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  // Add other settings here
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { addToast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data: Settings = await response.json();
        setSettings(data);
      } else {
        setError(true);
        addToast('Failed to load settings.', 'error');
      }
    } catch (err) {
      setError(true);
      addToast('Network error while fetching settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    if (!settings) return;
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, theme: newTheme }),
      });
      if (response.ok) {
        setSettings({ ...settings, theme: newTheme });
        addToast('Theme updated successfully!', 'success');
      } else {
        addToast('Failed to update theme.', 'error');
      }
    } catch (err) {
      addToast('Network error while updating theme.', 'error');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !settings) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load settings.</p>
        <button
          onClick={fetchSettings}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Appearance</h2>
          <div className="bg-surface rounded-lg p-6">
            <div className="flex items-center gap-4">
              <label>Theme:</label>
               <select
                 value={settings.theme}
                 onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                 className="h-11 px-3 bg-white border border-gray-300 rounded-md"
                 tabIndex={1}
               >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="bg-surface rounded-lg p-6">
            <p>Account settings will be here.</p>
             <button onClick={() => setShowDeleteModal(true)} className="mt-4 text-danger hover:underline">Delete Account</button>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4">Integrations</h2>
          <div className="bg-surface rounded-lg p-6">
            <p>Integrations settings will be here.</p>
          </div>
        </section>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Delete Account</h2>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div className="flex justify-end mt-4">
            <button onClick={() => setShowDeleteModal(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button onClick={() => { /* delete account */ addToast('Account deleted', 'success'); setShowDeleteModal(false); }} className="px-4 py-2 bg-danger text-white rounded">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
