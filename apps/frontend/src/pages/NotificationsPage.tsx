import React, { useState } from 'react';

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  { id: '1', message: 'User1 commented on your snippet.', read: false },
  { id: '2', message: 'Your snippet "My Awesome Snippet" has been executed.', read: false },
  { id: '3', message: 'You have a new follower.', read: true },
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(dummyNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>
      <div className="bg-surface rounded-lg">
        <ul>
          {notifications.map(notification => (
            <li
              key={notification.id}
              className={`p-4 border-b border-gray-200 ${notification.read ? 'text-muted' : ''}`}
            >
              {notification.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;
