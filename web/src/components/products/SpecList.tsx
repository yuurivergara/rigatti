import type { ReactNode } from 'react';

export type Spec = {
  label: string;
  value: ReactNode;
};

export function SpecList({ specs }: { specs: Spec[] }) {
  return (
    <dl className="border-t border-rule">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5"
        >
          <dt className="eyebrow">{spec.label}</dt>
          <dd className="numeric text-right text-[13px]">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
