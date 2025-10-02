import React from 'react';
import BenchmarkChart from '../components/BenchmarkChart';
import Leaderboard from '../components/Leaderboard';
import BadgesDisplay from '../components/BadgesDisplay';
import useTranslation from '../hooks/useTranslation';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const recentRuns = [
    {
      run_id: 'run-xyz-123',
      service: 'product_service',
      impl: 'python',
      duration: '30s',
      p95: '85ms',
      status: 'Completed',
      timestamp: '2025-09-16 10:00:00',
    },
    {
      run_id: 'run-abc-456',
      service: 'user_service',
      impl: 'nodejs',
      duration: '25s',
      p95: '120ms',
      status: 'Failed',
      timestamp: '2025-09-16 09:30:00',
    },
    {
      run_id: 'run-def-789',
      service: 'cart_service',
      impl: 'python',
      duration: '35s',
      p95: '90ms',
      status: 'Completed',
      timestamp: '2025-09-16 09:00:00',
    },
  ];

  const challenges = [
    { id: 'c1', name: t('run_5_benchmarks'), progress: 3, total: 5, type: 'weekly' },
    { id: 'c2', name: t('swap_runtime_10_times'), progress: 7, total: 10, type: 'weekly' },
  ];

  const benchmarkStreaks = [
    { id: 'bs1', name: t('product_service_benchmark_streak'), current: 5, best: 10 },
    { id: 'bs2', name: t('user_service_benchmark_streak'), current: 2, best: 5 },
  ];

  const leaderboardData = [
    { id: 'u1', username: 'Alice', xp: 150 },
    { id: 'u2', username: 'Bob', xp: 120 },
    { id: 'u3', username: 'Charlie', xp: 100 },
  ];

  const badgesData = [
    { name: t('polyglot_explorer'), description: t('explored_all_runtimes'), icon: '🌍' },
    { name: t('benchmark_guru'), description: t('ran_100_benchmarks'), icon: '📊' },
    { name: t('master_contributor'), description: t('made_5_contributions'), icon: '⭐' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{t('latency')} (ms)</h2>
          <BenchmarkChart chart_types={['line']} tooltip_format='locale' />
        </div>

        {/* Memory Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{t('memory_usage')} (MB)</h2>
          <BenchmarkChart chart_types={['bar']} tooltip_format='locale' />
        </div>
      </div>

      {/* Challenges and Streaks Panel */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{t('weekly_challenges')}</h2>
          <ul className="space-y-2">
            {challenges.map((challenge) => (
              <li key={challenge.id} className="flex justify-between items-center">
                <span>{challenge.name}</span>
                <span className="font-semibold">{challenge.progress}/{challenge.total}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{t('benchmark_streaks')}</h2>
          <ul className="space-y-2">
            {benchmarkStreaks.map((streak) => (
              <li key={streak.id} className="flex justify-between items-center">
                <span>{streak.name}</span>
                <span className="font-semibold">{t('current')}: {streak.current} / {t('best')}: {streak.best}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Runs Table */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">{t('recent_runs_table')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 uppercase font-semibold text-sm">{t('run_id')}</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">{t('service')}</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">{t('implementation')}</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">{t('duration')}</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">{t('p95')}</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">{t('status')}</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">{t('timestamp')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {recentRuns.map((run) => (
                <tr key={run.run_id}>
                  <td className="py-3 px-4">{run.run_id}</td>
                  <td className="py-3 px-4">{run.service}</td>
                  <td className="py-3 px-4">{run.impl}</td>
                  <td className="py-3 px-4">{run.duration}</td>
                  <td className="py-3 px-4">{run.p95}</td>
                  <td className="py-3 px-4">{run.status}</td>
                  <td className="py-3 px-4">{run.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboards Panel */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">{t('leaderboards')}</h2>
        <Leaderboard title={t('global_leaderboard')} data={leaderboardData} />
      </div>

      {/* Badges Panel */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">{t('badges')}</h2>
        <BadgesDisplay badges={badgesData} />
      </div>

      {/* Alerts Panel */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">{t('alerts')}</h2>
        <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center">
          <p className="text-gray-500">{t('alerts_panel')}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;