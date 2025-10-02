
import React, { useState, useEffect, useMemo } from 'react';
import { fetchTopUsers } from '../services/api';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState('');
  const [timePeriodFilter, setTimePeriodFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const getLeaderboard = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('session_token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchTopUsers(token, languageFilter, timePeriodFilter);
        if (data.status === 'error') {
          setError(data.message);
        } else {
          setLeaderboard(data);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    getLeaderboard();
  }, [languageFilter, timePeriodFilter]);

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => b.score - a.score);
  }, [leaderboard]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">Leaderboard</h1>
      <div className="mb-4 flex space-x-4">
        <select 
          className="p-2 border rounded-md bg-[var(--color-background)] text-[var(--color-text-primary)] border-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          value={languageFilter}
          onChange={e => setLanguageFilter(e.target.value)}
        >
          <option value="">All Languages</option>
          <option value="Python">Python</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Go">Go</option>
          <option value="Rust">Rust</option>
        </select>
        <select 
          className="p-2 border rounded-md bg-[var(--color-background)] text-[var(--color-text-primary)] border-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          value={timePeriodFilter}
          onChange={e => setTimePeriodFilter(e.target.value as 'daily' | 'weekly' | 'monthly')}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {loading && <p className="text-[var(--color-text-secondary)]">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-[var(--color-background)] shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-[var(--color-text-secondary)]/30">
            <thead className="bg-[var(--color-background)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Snippets Shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-text-secondary)]/20">
              {sortedLeaderboard.map((entry, index) => (
                <tr key={entry.user_id} className="text-[var(--color-text-primary)]">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.snippets_shared}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
