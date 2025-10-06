import React from 'react';

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={`bg-surface animate-pulse ${className}`}
      style={{
        width,
        height,
        animation: 'pulse 1200ms ease-in-out infinite',
      }}
    />
  );
};

export default LoadingSkeleton;
