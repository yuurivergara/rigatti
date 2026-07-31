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

  return (
    <aside className="flex shrink-0 flex-col gap-8 border-b border-rule bg-surface p-4 md:w-64 md:border-r md:border-b-0 md:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center bg-ink font-display text-sm text-paper">
          {initials(session.company.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">{session.company.name}</p>
          <p className="eyebrow">{isAdmin ? 'admin' : 'leitura'}</p>
        </div>
      </div>

      <nav className="flex gap-1 md:flex-col">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 border px-3 py-2 text-sm font-medium transition-colors',
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

      <div className="flex items-center gap-2 md:mt-auto md:flex-col md:items-stretch md:gap-3 md:border-t md:border-rule md:pt-4">
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <span className="grid size-8 shrink-0 place-items-center border border-rule font-mono text-[11px]">
            {initials(session.user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{session.user.name}</p>
            <p className="truncate text-[11px] text-ink-soft">{session.user.email}</p>
          </div>
        </div>

        <div className="ml-auto flex gap-2 md:ml-0">
          <ThemeToggle />
          <Button size="sm" onClick={logout} className="md:flex-1">
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}
