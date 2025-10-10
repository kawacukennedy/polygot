import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import {
  getAnalyticsOverview,
  getUsersGrowth,
  getSnippetsGrowth,
  getLanguageDistribution,
  getTopUsersAnalytics,
  getRecentActivity
} from '../services/api';

interface OverviewData {
  users: {
    total: number;
    newLast30Days: number;
    newLast7Days: number;
  };
  snippets: {
    total: number;
    public: number;
    newLast30Days: number;
  };
  executions: {
    total: number;
    last30Days: number;
    successRate: string;
  };
  comments: {
    total: number;
    last30Days: number;
  };
}

interface GrowthData {
  date: string;
  users?: number;
  snippets?: number;
}

interface LanguageData {
  language: string;
  count: number;
}

interface TopUser {
  id: string;
  username: string;
  avatarUrl?: string;
  count: number;
}

interface RecentActivity {
  recentSnippets: Array<{
    id: string;
    title: string;
    author: string;
    createdAt: string;
  }>;
  recentExecutions: Array<{
    id: string;
    snippetTitle: string;
    user: string;
    status: string;
    startedAt: string;
  }>;
  recentComments: Array<{
    id: string;
    snippetTitle: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const { addToast } = useToast();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [usersGrowth, setUsersGrowth] = useState<GrowthData[]>([]);
  const [snippetsGrowth, setSnippetsGrowth] = useState<GrowthData[]>([]);
  const [languageDistribution, setLanguageDistribution] = useState<LanguageData[]>([]);
  const [topUsers, setTopUsers] = useState<{ snippetCreators: TopUser[]; executors: TopUser[] } | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [
        overviewData,
        usersGrowthData,
        snippetsGrowthData,
        languageData,
        topUsersData,
        activityData
      ] = await Promise.all([
        getAnalyticsOverview(),
        getUsersGrowth(30),
        getSnippetsGrowth(30),
        getLanguageDistribution(),
        getTopUsersAnalytics(10),
        getRecentActivity(10)
      ]);

      setOverview(overviewData);
      setUsersGrowth(usersGrowthData);
      setSnippetsGrowth(snippetsGrowthData);
      setLanguageDistribution(languageData);
      setTopUsers(topUsersData);
      setRecentActivity(activityData);
    } catch (error) {
      addToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'TIMEOUT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <LoadingSkeleton height="100px" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.users.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{overview.users.newLast30Days} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.snippets.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.snippets.public} public, +{overview.snippets.newLast30Days} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.executions.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.executions.last30Days} this month, {overview.executions.successRate}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.comments.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{overview.comments.last30Days} this month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Language Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {languageDistribution.slice(0, 10).map((lang) => (
                  <div key={lang.language} className="flex items-center justify-between">
                    <span className="font-medium">{lang.language}</span>
                    <Badge variant="secondary">{lang.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              {topUsers && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Most Snippets Created</h4>
                    <div className="space-y-2">
                      {topUsers.snippetCreators.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <Badge variant="outline">{user.count} snippets</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Most Active Executors</h4>
                    <div className="space-y-2">
                      {topUsers.executors.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <Badge variant="outline">{user.count} runs</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {recentActivity && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Snippets */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Snippets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.recentSnippets.map((snippet) => (
                    <div key={snippet.id} className="border-b pb-2 last:border-b-0">
                      <h4 className="font-medium text-sm">{snippet.title}</h4>
                      <p className="text-xs text-gray-600">by {snippet.author}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(snippet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.recentExecutions.map((execution) => (
                    <div key={execution.id} className="border-b pb-2 last:border-b-0">
                      <h4 className="font-medium text-sm">{execution.snippetTitle}</h4>
                      <p className="text-xs text-gray-600">by {execution.user}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(execution.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.recentComments.map((comment) => (
                    <div key={comment.id} className="border-b pb-2 last:border-b-0">
                      <p className="text-sm line-clamp-2">{comment.content}</p>
                      <p className="text-xs text-gray-600">by {comment.author}</p>
                      <p className="text-xs text-gray-500">
                        on {comment.snippetTitle}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
