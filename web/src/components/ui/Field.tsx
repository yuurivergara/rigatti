import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

// Sem largura: cada uso define a sua, evitando que `w-full` e `w-auto`
// disputem a mesma especificidade.
const CONTROL =
  'rounded-[var(--radius-card)] border border-rule bg-surface px-3 py-2 text-sm ' +
  'placeholder:text-ink-soft/70 transition-colors focus:border-indigo focus:outline-none';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function TextInput({ className = 'w-full', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function TextArea({ className = 'w-full', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${CONTROL} min-h-24 resize-y ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${CONTROL} ${className}`} {...props} />;
}

export function Checkbox({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-[var(--color-indigo)]" {...props} />
      {label}
    </label>
  );
}
