import React from 'react';
import { cn } from '../utils/cn.js';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#111827] border border-gray-800/80 rounded-xl p-5 transition-all duration-200 shadow-sm',
        hover && 'hover:border-indigo-500/40 hover:bg-[#151D30] hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
