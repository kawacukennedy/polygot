import React from 'react';

interface BenchmarkChartProps {
  chart_types: ('line' | 'bar')[];
  tooltip_format: 'locale';
}

const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ chart_types, tooltip_format }) => {
  return (
    <div className="bg-[var(--color-background)] p-4 rounded-lg shadow-md">
      <h3 className="text-md font-medium text-[var(--color-text-secondary)]">Benchmark Chart</h3>
      <div className="h-48 bg-[var(--color-text-secondary)]/20 rounded-md flex items-center justify-center mt-2">
        <p className="text-[var(--color-text-secondary)]">Chart visualization ({chart_types.join(', ')})</p>
      </div>
    </div>
  );
};

export default BenchmarkChart;