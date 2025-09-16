import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUser } from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  profile: {
    name: string;
    avatar_url: string;
  };
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserDetails = async () => {
      if (!id) {
        setError('User ID not provided.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('session_token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchUser(id, token);
        if (userData.status === 'error') {
          setError(userData.message || 'Failed to fetch user details.');
        } else {
          setUser(userData);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching user details.');
      } finally {
        setLoading(false);
      }
    };

    getUserDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading user profile...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">No user data found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4">
          <img
            src={user.profile.avatar_url || 'https://via.placeholder.com/150'}
            alt="User Avatar"
            className="w-24 h-24 rounded-full mr-4 object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user.profile.name || 'N/A'}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <p className="text-gray-700">User ID: {user.id}</p>
        {/* Add more user details here as needed */}
      </div>
    </div>
  );
};

export default UserProfilePage;
