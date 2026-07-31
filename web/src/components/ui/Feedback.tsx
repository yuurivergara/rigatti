import type { ReactNode } from 'react';

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-[var(--radius-card)] border border-signal/30 bg-signal-soft px-3 py-2 text-sm text-signal"
    >
      {children}
    </p>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-rule-strong px-6 py-16 text-center">
      <p className="font-display text-base text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    </div>
  );
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' }) {
  const tones = {
    neutral: 'border-rule text-ink-soft',
    accent: 'border-indigo/30 bg-indigo-soft text-indigo',
  } as const;

  return (
    <span className={`inline-flex items-center border px-2 py-0.5 font-mono text-[11px] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PulseDot() {
  return (
    <span
      aria-hidden
      className="inline-block size-1.5 animate-pulse rounded-full bg-indigo"
    />
  );
}
