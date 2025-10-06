import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import { apiCall } from '../services/apiClient'; // Import apiCall

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

interface DashboardSummary {
  recent_snippets: SnippetSummary[];
  leaderboard_preview: LeaderboardEntry[];
  achievements_panel: Achievement[];
}

const RecentSnippets: React.FC<{ snippets: SnippetSummary[] }> = ({ snippets }) => (
  <div className="bg-surface rounded-lg p-6 min-h-[220px]">
    <h2 className="text-xl font-bold mb-4">Recent Snippets</h2>
    <ul>
      {snippets.slice(0, 5).map(snippet => (
        <li key={snippet.id} className="mb-2 h-18 flex items-center">
          <a href={`/snippets/${snippet.id}`} className="text-primary hover:underline">
            {snippet.title} ({snippet.language})
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const LeaderboardPreview: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => (
  <div className="bg-surface rounded-lg p-6 min-h-[220px]">
    <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
    <ul>
      {entries.slice(0, 5).map(entry => (
        <li key={entry.id} className="mb-2">
          {entry.user}: {entry.score}
        </li>
      ))}
    </ul>
    <button className="mt-4 text-primary hover:underline" onClick={() => window.location.href = '/leaderboard'}>
      View more
    </button>
  </div>
);

const AchievementsPanel: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => (
  <div className="bg-surface rounded-lg p-6 min-h-[220px]">
    <h2 className="text-xl font-bold mb-4">Achievements</h2>
    <div className="grid grid-cols-3 gap-4">
      {achievements.filter(a => a.unlocked).slice(0, 6).map(achievement => (
        <div
          key={achievement.id}
          className={`h-20 rounded-md flex items-center justify-center bg-success text-white animate-pulse`}
          style={{ animation: 'confetti 800ms' }}
        >
          {achievement.name}
        </div>
      ))}
    </div>
  </div>
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
        <p className="text-danger mb-4">Failed to load dashboard data.</p>
        <button
          onClick={fetchData}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" style={{ gap: '24px' }}>
      <RecentSnippets snippets={dashboardData.recent_snippets} />
      <LeaderboardPreview entries={dashboardData.leaderboard_preview} />
      <AchievementsPanel achievements={dashboardData.achievements_panel} />
    </div>
  );
};

export default DashboardPage;
