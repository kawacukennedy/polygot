import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Placeholder components for the dashboard sections
const RecentSnippets: React.FC = () => (
  <div className="bg-surface rounded-lg p-6 min-h-[220px]">
    <h2 className="text-xl font-bold mb-4">Recent Snippets</h2>
    <ul>
      <li className="h-16 mb-2">Snippet 1</li>
      <li className="h-16 mb-2">Snippet 2</li>
      <li className="h-16 mb-2">Snippet 3</li>
    </ul>
  </div>
);

const LeaderboardPreview: React.FC = () => (
  <div className="bg-surface rounded-lg p-6 min-h-[220px]">
    <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
    <ul>
      <li className="h-12 mb-2">User 1</li>
      <li className="h-12 mb-2">User 2</li>
      <li className="h-12 mb-2">User 3</li>
      <li className="h-12 mb-2">User 4</li>
      <li className="h-12 mb-2">User 5</li>
    </ul>
  </div>
);

const AchievementsPanel: React.FC = () => (
  <div className="bg-surface rounded-lg p-6 min-h-[220px]">
    <h2 className="text-xl font-bold mb-4">Achievements</h2>
    <div className="grid grid-cols-3 gap-4">
      <div className="h-20 bg-gray-200 rounded-md"></div>
      <div className="h-20 bg-gray-200 rounded-md"></div>
      <div className="h-20 bg-gray-200 rounded-md"></div>
      <div className="h-20 bg-gray-200 rounded-md"></div>
      <div className="h-20 bg-gray-200 rounded-md"></div>
      <div className="h-20 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);


const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch('/dashboard/summary');
        // const data = await response.json();
        // For now, we'll just simulate a successful fetch
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load dashboard data.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <RecentSnippets />
      <LeaderboardPreview />
      <AchievementsPanel />
    </div>
  );
};

export default DashboardPage;
