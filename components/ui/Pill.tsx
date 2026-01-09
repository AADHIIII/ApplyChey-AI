
import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

export const Pill: React.FC<PillProps> = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-background text-secondary-foreground border border-border',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};