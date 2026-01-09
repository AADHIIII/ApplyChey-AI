

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`bg-card p-6 shadow-md rounded-lg border border-border ${className}`}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';