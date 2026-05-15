'use client';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  variant?: 'default' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const BASE = 'flex items-center gap-1.5 rounded-[8px] border cursor-pointer transition-all duration-150 font-exo text-left disabled:opacity-40 disabled:cursor-not-allowed select-none';

const VARIANTS = {
  default: 'bg-background border-gray-700 hover:text-background hover:bg-foreground',
  danger: 'bg-red-500 border-red-900 hover:bg-red-900 hover:border-red-950',
};

const SIZES = {
  sm: 'px-2 py-1 text-[11px]',
  md: 'px-2.5 py-1.5 text-xs',
};

export default function Button({
  children, onClick, active = false, variant = 'default',
  size = 'md', disabled = false, fullWidth = false, className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        BASE,
        VARIANTS[variant],
        SIZES[size],
        active ? 'text-background bg-foreground' : '',
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
