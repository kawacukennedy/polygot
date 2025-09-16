import React from 'react';

const DashboardPage: React.FC = () => {
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
              {/* Placeholder row */}
              <tr>
                <td className="py-3 px-4">run-xyz-123</td>
                <td className="py-3 px-4">product_service</td>
                <td className="py-3 px-4">python</td>
                <td className="py-3 px-4">30s</td>
                <td className="py-3 px-4">85ms</td>
                <td className="py-3 px-4">Completed</td>
                <td className="py-3 px-4">2025-09-16 10:00:00</td>
              </tr>
            </tbody>
          </table>
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

export default DashboardPage;-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Alerts</h2>
        <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Alerts Panel</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;