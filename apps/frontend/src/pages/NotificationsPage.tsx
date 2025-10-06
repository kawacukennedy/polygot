import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data: Notification[] = await response.json();
        setNotifications(data);
      } else {
        setError(true);
        addToast('Failed to load notifications.', 'error');
      }
    } catch (err) {
      setError(true);
      addToast('Network error while fetching notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        addToast('All notifications marked as read!', 'success');
      } else {
        addToast('Failed to mark all notifications as read.', 'error');
      }
    } catch (err) {
      addToast('Network error while marking notifications as read.', 'error');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load notifications.</p>
        <button
          onClick={fetchNotifications}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-primary hover:underline"
          tabIndex={1}
        >
          Mark all as read
        </button>
      </div>
       <div className="bg-surface rounded-lg">
        <ul role="list">
          {notifications.length === 0 ? (
            <li className="p-4 text-muted">No notifications.</li>
          ) : (
            notifications.map(notification => (
              <li
                key={notification.id}
                className={`p-4 border-b border-gray-200 cursor-pointer ${notification.read ? 'text-muted' : ''}`}
                style={{ height: '80px' }}
                role="listitem"
                onClick={() => {/* open modal or navigate */ addToast('Notification clicked', 'info')}}
              >
                <div className="flex justify-between">
                  <span>{notification.message}</span>
                  <span className="text-xs">{new Date(notification.createdAt).toLocaleString()}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;
