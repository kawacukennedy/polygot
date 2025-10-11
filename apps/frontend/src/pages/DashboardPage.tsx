import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import { apiCall } from '../services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SnippetSummary {
  id: string;
  title: string;
  language: string;
}

interface LeaderboardEntry {
  id: string;
  user: string;
  score: number;
}

interface Achievement {
  id: string;
  name: string;
  unlocked: boolean;
}

interface LanguageStat {
  language: string;
  count: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface DashboardSummary {
  recent_snippets: SnippetSummary[];
  top_languages: LanguageStat[];
  leaderboard_preview: LeaderboardEntry[];
  achievements: Achievement[];
  activity_feed: Activity[];
}

const RecentSnippets: React.FC<{ snippets: SnippetSummary[] }> = ({ snippets }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Snippets</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {snippets.slice(0, 5).map(snippet => (
            <li key={snippet.id}>
              <button
                onClick={() => navigate(`/snippets/${snippet.id}`)}
                className="text-left text-primary hover:underline"
              >
                {snippet.title} ({snippet.language})
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const LeaderboardPreview: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {entries.slice(0, 5).map(entry => (
            <li key={entry.id} className="flex justify-between">
              <span>{entry.user}</span>
              <span className="font-semibold">{entry.score}</span>
            </li>
          ))}
        </ul>
        <Button
          variant="link"
          className="mt-4 p-0"
          onClick={() => navigate('/leaderboard')}
        >
          View more
        </Button>
      </CardContent>
    </Card>
  );
};

const TopLanguagesChart: React.FC<{ languages: LanguageStat[] }> = ({ languages }) => (
  <Card>
    <CardHeader>
      <CardTitle>Top Languages</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={languages}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="language" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const AchievementsCarousel: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => (
  <Card>
    <CardHeader>
      <CardTitle>Achievements</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex space-x-4 overflow-x-auto">
        {achievements.filter(a => a.unlocked).slice(0, 4).map(achievement => (
          <div
            key={achievement.id}
            className="h-16 w-16 rounded-md flex items-center justify-center bg-green-500 text-white text-sm font-medium flex-shrink-0"
          >
            {achievement.name}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ActivityFeed: React.FC<{ activities: Activity[] }> = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle>Activity Feed</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {activities.slice(0, 5).map(activity => (
          <li key={activity.id} className="text-sm">
            {activity.description}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);


const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiCall<DashboardSummary>('/dashboard/summary');
      setDashboardData(data);
    } catch (err: any) {
      setError(true);
      addToast(err.message || 'Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <LoadingSkeleton height="220px" />
        <LoadingSkeleton height="220px" />
        <LoadingSkeleton height="220px" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">Failed to load dashboard data.</p>
        <Button onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" style={{ gap: '24px' }}>
      <RecentSnippets snippets={dashboardData.recent_snippets} />
      <TopLanguagesChart languages={dashboardData.top_languages} />
      <LeaderboardPreview entries={dashboardData.leaderboard_preview} />
      <AchievementsCarousel achievements={dashboardData.achievements} />
      <ActivityFeed activities={dashboardData.activity_feed} />
    </div>
  );
};

export default DashboardPage;
