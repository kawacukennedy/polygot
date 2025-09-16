import React from 'react';
import MetricTileArea from '../components/MetricTileArea';
import BenchmarkChart from '../components/BenchmarkChart';

const DashboardPage: React.FC = () => {
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Latency (ms)</h2>
          <BenchmarkChart chart_types={['line']} tooltip_format='locale' />
        </div>

        {/* Memory Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Memory Usage (MB)</h2>
          <BenchmarkChart chart_types={['bar']} tooltip_format='locale' />
        </div>
      </div>

      {/* Recent Runs Table */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Benchmark Runs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Run ID</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Service</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Implementation</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Duration</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">p95</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Status</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Timestamp</th>
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
        <h2 className="text-xl font-bold mb-4">Leaderboards</h2>
        <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Leaderboards will be here</p>
        </div>
      </div>

      {/* Badges Panel */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Badges</h2>
        <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Badges will be here</p>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Alerts</h2>
        <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Alerts Panel</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;