import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggle}
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className="px-2"
    >
      <span aria-hidden>{isDark ? '☀' : '☾'}</span>
    </Button>
  );
}
