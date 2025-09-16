import React, { useState } from 'react';

interface QuickBenchmarkProps {
  default_duration_s: number;
  allow_full_run: boolean;
  onRunBenchmark: () => void;
  isBenchmarking: boolean;
}

const QuickBenchmark: React.FC<QuickBenchmarkProps> = ({
  default_duration_s,
  allow_full_run,
  onRunBenchmark,
  isBenchmarking,
}) => {
  const [duration, setDuration] = useState(default_duration_s);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-md font-medium text-gray-500 mb-2">Quick Benchmark</h3>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-24 p-2 border rounded-md"
          disabled={isBenchmarking}
        />
        <span className="text-gray-600">seconds</span>
      </div>
      {allow_full_run && (
        <p className="text-sm text-gray-500 mt-2">
          (Full run option available)
        </p>
      )}
      <button
        onClick={onRunBenchmark}
        disabled={isBenchmarking}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 w-full ripple-button"
      >
        {isBenchmarking ? 'Running Benchmark...' : 'Run Benchmark'}
      </button>
    </div>
  );
};

export default QuickBenchmark;