import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        glass
          ? 'glass-card'
          : 'bg-white border-slate-200/80 shadow-sm'
      } ${
        hover ? 'hover:shadow-soft-lg hover:border-slate-300 transition-shadow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
