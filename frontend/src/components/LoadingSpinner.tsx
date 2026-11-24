import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn.js';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  className,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 gap-3 text-gray-400', className)}>
      <Loader2 className={cn('animate-spin text-indigo-500', sizeMap[size])} />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
};
