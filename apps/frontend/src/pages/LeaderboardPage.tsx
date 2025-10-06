import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { io } from 'socket.io-client';
import { useToast } from '../contexts/ToastContext';

interface LeaderboardEntry {
  rank: number;
  avatar: string;
  user: string;
  score: number;
  language: string;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [flashRows, setFlashRows] = useState<Set<number>>(new Set());
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch data from an API
        // For now, we'll just use the dummy data
        const response = await fetch('/api/leaderboard'); // Assuming an API endpoint for initial fetch
        if (response.ok) {
          const data: LeaderboardEntry[] = await response.json();
          setLeaderboard(data);
        } else {
          addToast('Failed to load leaderboard data.', 'error');
        }
      } catch (err) {
        addToast('Network error while fetching leaderboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    const socket = io('http://localhost:3001'); // Assuming WebSocket server runs on port 3001
    socket.on('leaderboard_updates', (updatedLeaderboard: LeaderboardEntry[]) => {
      setLeaderboard(updatedLeaderboard);
      // Flash updated rows
      const updatedRanks = new Set(updatedLeaderboard.map(e => e.rank));
      setFlashRows(updatedRanks);
      setTimeout(() => setFlashRows(new Set()), 600);
      addToast('Leaderboard updated in real-time!', 'info');
    });

    return () => {
      socket.disconnect();
    };
  }, [languageFilter, timeFilter]);

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.user.toLowerCase().includes(debouncedQuery.toLowerCase()) &&
    (languageFilter === 'all' || entry.language === languageFilter)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="h-11 px-3 bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
            tabIndex={1}
          >
            <option value="all">All Languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="php">PHP</option>
            <option value="rust">Rust</option>
            <option value="ruby">Ruby</option>
          </select>
          <div className="flex bg-surface rounded-md border border-gray-300" role="group" tabIndex={2}>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-4 py-2 rounded-l-md ${timeFilter === '7d' ? 'bg-primary text-white' : ''}`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-4 py-2 ${timeFilter === '30d' ? 'bg-primary text-white' : ''}`}
            >
              30d
            </button>
            <button
              onClick={() => setTimeFilter('all-time')}
              className={`px-4 py-2 rounded-r-md ${timeFilter === 'all-time' ? 'bg-primary text-white' : ''}`}
            >
              All Time
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Find user by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 px-3 bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring"
          tabIndex={3}
        />
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        {filteredLeaderboard.length === 0 ? (
          <p className="text-muted">No results — broaden filters</p>
        ) : (
          <div className="bg-surface rounded-lg">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left">Rank</th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Score</th>
                  <th className="p-4 text-left">Language</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`border-b border-gray-200 ${flashRows.has(entry.rank) ? 'bg-yellow-200 animate-pulse' : ''}`}
                    style={{ height: '64px' }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                        next?.focus();
                      } else if (e.key === 'ArrowUp') {
                        const prev = e.currentTarget.previousElementSibling as HTMLElement;
                        prev?.focus();
                      }
                    }}
                  >
                    <td className="p-4">{entry.rank}</td>
                    <td className="p-4 flex items-center">
                      <img src={entry.avatar} alt={entry.user} className="w-10 h-10 rounded-full mr-4" />
                      {entry.user}
                    </td>
                    <td className="p-4">{entry.score}</td>
                    <td className="p-4">{entry.language}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      )}
    </div>
  );
};

export default LeaderboardPage;
