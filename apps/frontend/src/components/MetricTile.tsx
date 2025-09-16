import React from 'react';

interface MetricTileProps {
  title: string;
  value: string | number;
  delta?: number;
  trend: 'up' | 'down' | 'flat';
  aria_label?: string;
}

const MetricTile: React.FC<MetricTileProps> = ({ title, value, delta, trend, aria_label }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-white p-4 rounded-lg shadow-md" aria-label={aria_label || `${title} metric`}>
      <h3 className="text-md font-medium text-gray-500">{title}</h3>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {delta !== undefined && (
          <span className={`text-sm font-semibold ${trendColor}`}>
            {trendArrow} {Math.abs(delta)}%
          </span>
        )}
      </div>
      {/* Placeholder for sparkline */}
      <div className="h-4 bg-gray-200 rounded-full mt-2"></div>
    </div>
  );
};

export default MetricTile;