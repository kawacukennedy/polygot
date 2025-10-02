import React from 'react';

interface BenchmarkChartProps {
  chart_types: ('line' | 'bar')[];
  tooltip_format: 'locale';
}

const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ chart_types, tooltip_format }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-md font-medium text-gray-500">Benchmark Chart</h3>
      <div className="h-48 bg-gray-200 rounded-md flex items-center justify-center mt-2">
        <p className="text-gray-500">Chart visualization ({chart_types.join(', ')})</p>
      </div>
    </div>
  );
};

export default BenchmarkChart;