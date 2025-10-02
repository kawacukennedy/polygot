import React, { useEffect, useState } from 'react';
import { fetchTopUsers } from '../services/api';

interface TopUser {
  user_id: string;
  username: string;
  score: number;
  language: string;
  snippets_shared: number;
  rank: number;
}

const languages = ['python', 'javascript', 'cpp', 'go', 'java', 'php', 'rust', 'ruby'];
const periods = ['daily', 'weekly', 'monthly'];

const TopUsersAnalyticsPage: React.FC = () => {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | undefined>(undefined);

  useEffect(() => {
    const getTopUsers = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('session_token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const analyticsData = await fetchTopUsers(token, selectedLanguage, selectedPeriod);
        if (analyticsData.status === 'error') {
          setError(analyticsData.message || 'Failed to fetch top users analytics.');
        } else {
          setTopUsers(analyticsData.data);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching top users analytics.');
      } finally {
        setLoading(false);
      }
    };

    getTopUsers();
  }, [selectedLanguage, selectedPeriod]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading top users analytics...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Top Users Analytics</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex space-x-4 mb-4">
          <div>
            <label htmlFor="language-select" className="block text-gray-700 text-sm font-bold mb-2">Language:</label>
            <select
              id="language-select"
              value={selectedLanguage || ''}
              onChange={(e) => setSelectedLanguage(e.target.value || undefined)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">All</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="period-select" className="block text-gray-700 text-sm font-bold mb-2">Period:</label>
            <select
              id="period-select"
              value={selectedPeriod || ''}
              onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | undefined)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">All</option>
              {periods.map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </div>

        {topUsers.length === 0 ? (
          <p>No top users data found for the selected filters.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snippets Shared</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topUsers.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.snippets_shared}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TopUsersAnalyticsPage;
