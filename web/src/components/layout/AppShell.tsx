import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

/**
 * A barra lateral só vira coluna a partir de `lg`. Em tablet retrato ela fica
 * como barra superior, senão sobraria pouca largura para o conteúdo.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col lg:flex-row">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule bg-surface px-5 py-5 lg:px-7">
      <div>
        <h1 className="text-[22px] font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}
