import React from 'react';

type Trend = 'up' | 'down' | 'flat';

interface MetricTileProps {
  title: string;
  value: string | number;
  delta?: number;
  trend?: Trend;
  aria_label?: string;
}

const MetricTile: React.FC<MetricTileProps> = ({
  title,
  value,
  delta,
  trend = 'flat',
  aria_label,
}) => {
  const getTrendIcon = (currentTrend: Trend) => {
    switch (currentTrend) {
      case 'up':
        return <span className="text-success">▲</span>; // Up arrow
      case 'down':
        return <span className="text-danger">▼</span>; // Down arrow
      case 'flat':
      default:
        return <span className="text-muted">—</span>; // Dash
    }
  };

  const getDeltaColor = (currentTrend: Trend) => {
    switch (currentTrend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-danger';
      case 'flat':
      default:
        return 'text-muted';
    }
  };

  return (
    <div className="bg-surface-light p-4 rounded-lg shadow flex flex-col justify-between"
         aria-label={aria_label || `${title}: ${value}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-muted">{title}</h4>
        {delta !== undefined && (
          <div className={`flex items-center text-sm ${getDeltaColor(trend)}`}>
            {getTrendIcon(trend)}
            <span className="ml-1">{Math.abs(delta)}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {/* Placeholder for sparkline */}
      <div className="h-8 bg-gray-100 rounded-md flex items-center justify-center text-xs text-muted">
        Sparkline Placeholder
      </div>
    </div>
  );
};

export default MetricTile;
