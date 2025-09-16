import React from 'react';
import Button from './Button';

interface QuickBenchmarkProps {
  default_duration_s: number;
  allow_full_run: boolean;
}

const QuickBenchmark: React.FC<QuickBenchmarkProps> = ({
  default_duration_s,
  allow_full_run,
}) => {
  const handleRunBenchmark = (duration: number) => {
    console.log(`Running benchmark for ${duration} seconds`);
    // In a real app, this would trigger an API call
  };

  return (
    <div className="bg-surface-light p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Quick Benchmark</h3>
      <div className="flex flex-col space-y-3">
        <Button
          label={`Run ${default_duration_s}s Benchmark`}
          variant="primary"
          onClick={() => handleRunBenchmark(default_duration_s)}
        />
        {allow_full_run && (
          <Button
            label="Run Full Benchmark"
            variant="secondary"
            onClick={() => handleRunBenchmark(0)} // 0 could signify full run
          />
        )}
      </div>
      <p className="text-sm text-muted mt-4">Triggers a k6 benchmark against the currently selected implementation.</p>
    </div>
  );
};

export default QuickBenchmark;
