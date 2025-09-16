import React from 'react';
import MetricTile from './MetricTile';

interface MetricTileAreaProps {
  // Define props if needed, e.g., data for the metrics
}

const MetricTileArea: React.FC<MetricTileAreaProps> = () => {
  // Placeholder data for demonstration
  const metrics = [
    { title: 'Latency', value: '50ms', delta: 5, trend: 'up' as const },
    { title: 'Memory', value: '120MB', delta: 2, trend: 'down' as const },
    { title: 'RPS', value: '1200', delta: 0, trend: 'flat' as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <MetricTile
          key={metric.title}
          title={metric.title}
          value={metric.value}
          delta={metric.delta}
          trend={metric.trend}
        />
      ))}
    </div>
  );
};

export default MetricTileArea;