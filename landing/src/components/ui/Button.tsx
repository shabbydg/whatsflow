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
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]',
        {
          'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-lg hover:shadow-xl focus:ring-purple-500': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 shadow-sm hover:shadow-md focus:ring-gray-400': variant === 'secondary',
          'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50 active:bg-purple-100 focus:ring-purple-500 shadow-sm hover:shadow-md': variant === 'outline',
          'px-4 py-2 text-sm gap-2': size === 'sm',
          'px-6 py-2.5 text-base gap-2': size === 'md',
          'px-8 py-3.5 text-lg gap-3': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

