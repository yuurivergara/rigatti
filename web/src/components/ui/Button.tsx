import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-card)] border font-medium ' +
  'transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-indigo border-indigo text-white hover:bg-indigo/90',
  secondary: 'bg-surface border-rule text-ink hover:border-rule-strong hover:bg-paper',
  ghost: 'bg-transparent border-transparent text-ink-soft hover:text-ink hover:bg-paper',
  danger: 'bg-surface border-rule text-signal hover:bg-signal-soft hover:border-signal',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({ variant = 'secondary', size = 'md', className = '', ...props }: Props) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props} />;
}
