import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPopularLanguages, getRecentExecutions } from '../services/api';
import { PopularLanguage, RecentExecution } from '../types/Home';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [popularLanguages, setPopularLanguages] = useState<PopularLanguage[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingExecutions, setLoadingExecutions] = useState(true);
  const [errorLanguages, setErrorLanguages] = useState<string | null>(null);
  const [errorExecutions, setErrorExecutions] = useState<string | null>(null);
  const { addToast } = useToast();
  const [heroAnimationIn, setHeroAnimationIn] = useState(false);

  useEffect(() => {
    setHeroAnimationIn(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPopularLanguages = async () => {
        setLoadingLanguages(true);
        setErrorLanguages(null);
        try {
          const data = await getPopularLanguages();
          setPopularLanguages(data);
        } catch (err: any) {
          setErrorLanguages(err.message || 'Failed to fetch popular languages');
          addToast(err.message || 'Failed to fetch popular languages', 'error');
        } finally {
          setLoadingLanguages(false);
        }
      };

      const fetchRecentExecutions = async () => {
        setLoadingExecutions(true);
        setErrorExecutions(null);
        try {
          const data = await getRecentExecutions();
          setRecentExecutions(data);
        } catch (err: any) {
          setErrorExecutions(err.message || 'Failed to fetch recent executions');
          addToast(err.message || 'Failed to fetch recent executions', 'error');
        } finally {
          setLoadingExecutions(false);
        }
      };

      fetchPopularLanguages();
      fetchRecentExecutions();
    }
  }, [isAuthenticated]);

  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="text-center py-16 bg-card rounded-lg mb-6">
        <h1 className="text-4xl font-bold mb-4">
          Write, Run, Share Code in Any Language
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Cross-language collaborative code snippet platform with execution, sharing, leaderboards, analytics, and gamification.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/snippets/new">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/snippets">Browse Snippets</Link>
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Popular Languages</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLanguages ? (
            <div className="flex justify-center mt-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : errorLanguages ? (
            <Alert variant="destructive">
              <AlertDescription>{errorLanguages}</AlertDescription>
            </Alert>
          ) : popularLanguages.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={popularLanguages}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="language" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Snippets Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No popular languages data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Executions Section */}
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingExecutions ? (
            <div className="flex justify-center mt-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : errorExecutions ? (
            <Alert variant="destructive">
              <AlertDescription>{errorExecutions}</AlertDescription>
            </Alert>
          ) : recentExecutions.length > 0 ? (
            <ul className="space-y-2">
              {recentExecutions.map((exec) => (
                <li key={exec.id} className="border-b pb-2">
                  <p className="font-medium">
                    Snippet: {exec.snippet_id} - Language: {exec.language} - Status: {exec.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Executed at: {new Date(exec.executed_at).toLocaleString()} - Duration: {exec.duration_ms}ms
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No recent executions data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
