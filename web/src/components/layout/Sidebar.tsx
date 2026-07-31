import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { initials } from '../../lib/format';
import { Button } from '../ui/Button';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { to: '/produtos', label: 'Catálogo', index: '01' },
  { to: '/chat', label: 'Assistente', index: '02' },
];

export function Sidebar() {
  const { session, logout, isAdmin } = useAuth();
  if (!session) return null;

  const actions = (
    <div className="flex gap-2">
      <ThemeToggle />
      <Button size="sm" onClick={logout} className="lg:flex-1">
        Sair
      </Button>
    </div>
  );

  return (
    <aside className="flex shrink-0 flex-col gap-3 border-b border-rule bg-surface p-3 lg:w-64 lg:gap-8 lg:border-r lg:border-b-0 lg:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center bg-ink font-display text-sm text-paper">
          {initials(session.company.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">{session.company.name}</p>
          <p className="eyebrow">{isAdmin ? 'admin' : 'leitura'}</p>
        </div>

        {/* Até `lg` as ações ficam no topo; a partir dali, no rodapé com o usuário. */}
        <div className="ml-auto lg:hidden">{actions}</div>
      </div>

      <nav className="flex gap-1 lg:flex-col">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex flex-1 items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors lg:flex-none lg:gap-3',
                isActive
                  ? 'border-rule bg-paper text-ink'
                  : 'border-transparent text-ink-soft hover:text-ink',
              ].join(' ')
            }
          >
            <span className="font-mono text-[11px] text-ink-soft">{item.index}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden flex-col gap-3 border-t border-rule pt-4 lg:flex">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center border border-rule font-mono text-[11px]">
            {initials(session.user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{session.user.name}</p>
            <p className="truncate text-[11px] text-ink-soft">{session.user.email}</p>
          </div>
        </div>
        {actions}
      </div>
    </aside>
  );
}
