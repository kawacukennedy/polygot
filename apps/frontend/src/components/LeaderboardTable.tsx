import React, { useEffect, useState } from 'react';
import { getTopUsers } from '../services/api';
import { LeaderboardEntry } from '../types/Leaderboard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const LeaderboardTable: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>('7d'); // Default to 7 days
  const [sortBy, setSortBy] = useState<string>('score_desc'); // Default sorting
  const { addToast } = useToast();

  const socketRef = React.useRef<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = io('http://localhost:3003'); // Assuming execution service WebSocket URL

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket for leaderboard');
      });

       socketRef.current.on('leaderboard_updated', () => {
         addToast('Leaderboard updated in real-time!', 'info');
         fetchLeaderboard({ language: languageFilter, timePeriod: timePeriodFilter, sortBy: sortBy });
       });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket for leaderboard');
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isAuthenticated, showNotification, languageFilter, timePeriodFilter, sortBy]);

  const fetchLeaderboard = async (filters: { language?: string; timePeriod?: string; sortBy?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopUsers(filters);
      // The API should ideally return ranked data, but for now, we map it.
      // If sortBy is 'rank_asc', the API should handle it, or we sort here.
      const mappedData: LeaderboardEntry[] = data.map((item: any, index: number) => ({
        rank: index + 1, // Assuming API returns data already sorted by score_desc
        user: item.user.name || 'N/A',
        score: item.score || 0,
        language: item.language || 'N/A',
        snippetsShared: item.snippetsShared || 0,
      }));
      setLeaderboard(mappedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
      addToast(err.message || 'Failed to fetch leaderboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // fetchLeaderboard({ language: languageFilter, timePeriod: timePeriodFilter, sortBy: sortBy });
    }
  }, [isAuthenticated, languageFilter, timePeriodFilter, sortBy]);

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>Please log in to view the leaderboard.</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Card className="p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="space-y-2">
            <Label htmlFor="language-filter">Language</Label>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-period-filter">Time Period</Label>
            <Select value={timePeriodFilter} onValueChange={setTimePeriodFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort-by">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score_desc">Score (High to Low)</SelectItem>
                <SelectItem value="rank_asc">Rank (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Rank</th>
              <th className="text-left p-4">User</th>
              <th className="text-right p-4">Score</th>
              <th className="text-left p-4">Language</th>
              <th className="text-right p-4">Snippets Shared</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.rank} className="border-b">
                <td className="p-4 font-medium">{entry.rank}</td>
                <td className="p-4">{entry.user}</td>
                <td className="p-4 text-right">{entry.score}</td>
                <td className="p-4">{entry.language}</td>
                <td className="p-4 text-right">{entry.snippetsShared}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default LeaderboardTable;
