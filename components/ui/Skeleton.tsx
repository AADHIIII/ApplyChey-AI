
import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`bg-secondary animate-pulse rounded-md ${className}`}
      style={style}
    />
  );
};