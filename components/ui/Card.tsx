/**
 * Card Component
 * Reusable card container for content
 */

import { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  className = '',
  padding = 'md',
  children,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-5 sm:p-6 md:p-8',
    lg: 'p-6 sm:p-8 md:p-10',
  };

  const baseStyles = 'bg-[#3d4457] rounded-2xl shadow-2xl border border-[#4f5d75]/30';

  const combinedClassName = `${baseStyles} ${paddingStyles[padding]} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({
  className = '',
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({
  className = '',
  children,
  ...props
}: CardTitleProps) {
  return (
    <h1
      className={`text-xl sm:text-2xl font-semibold text-center tracking-tight text-white ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className = '',
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
