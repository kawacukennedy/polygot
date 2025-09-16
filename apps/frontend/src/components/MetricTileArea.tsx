import React from 'react';
import MetricTile from './MetricTile';

interface MetricTileAreaProps {
  tiles: Array<{ title: string; value: string | number; delta?: number; trend?: 'up' | 'down' | 'flat' }>;
}

const MetricTileArea: React.FC<MetricTileAreaProps> = ({ tiles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tiles.map((tile, index) => (
        <MetricTile
          key={index}
          title={tile.title}
          value={tile.value}
          delta={tile.delta}
          trend={tile.trend}
        />
      ))}
    </div>
  );
};

export default MetricTileArea;
