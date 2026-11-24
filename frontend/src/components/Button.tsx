import React from 'react';
import { cn } from '../utils/cn.js';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] border border-indigo-500/30',
    secondary:
      'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-gray-800/60 text-gray-200 border border-gray-700 active:scale-[0.98]',
    danger:
      'bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-600/20 active:scale-[0.98] border border-rose-500/30',
    ghost:
      'bg-transparent hover:bg-gray-800/40 text-gray-300 hover:text-white',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5 font-medium',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
