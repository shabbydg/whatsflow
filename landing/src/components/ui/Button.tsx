import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-purple-600 text-white hover:bg-purple-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'border-2 border-purple-600 text-purple-600 hover:bg-purple-50': variant === 'outline',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

