'use client';

import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'danger' | 'success';
}

export default function Card({ className = '', variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border-gray-200',
    highlight: 'bg-orange-50 border-orange-200',
    danger: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
  };

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
