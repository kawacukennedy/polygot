import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';

interface AnalyticsData {
  totalUsers: number;
  totalSnippets: number;
  totalExecutions: number;
  // Add more analytics data here
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } else {
        setError(true);
        addToast('Failed to load analytics data.', 'error');
      }
    } catch (err) {
      setError(true);
      addToast('Network error while fetching analytics data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load analytics data.</p>
        <button
          onClick={fetchAnalyticsData}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Total Users</h2>
          <p className="text-4xl font-bold text-primary">{analyticsData.totalUsers}</p>
        </div>
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Total Snippets</h2>
          <p className="text-4xl font-bold text-primary">{analyticsData.totalSnippets}</p>
        </div>
        <div className="bg-surface rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Total Executions</h2>
          <p className="text-4xl font-bold text-primary">{analyticsData.totalExecutions}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
