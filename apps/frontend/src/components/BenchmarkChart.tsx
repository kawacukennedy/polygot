import React from 'react';

interface BenchmarkChartProps {
  chart_types: Array<'line' | 'bar'>;
  tooltip_format: 'locale';
}

const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ chart_types, tooltip_format }) => {
  return (
    <div className="bg-surface-light p-4 rounded-lg shadow h-64 flex items-center justify-center text-muted">
      <p>Benchmark Chart Placeholder (Types: {chart_types.join(', ')}, Tooltip: {tooltip_format})</p>
    </div>
  );
};

export default BenchmarkChart;
