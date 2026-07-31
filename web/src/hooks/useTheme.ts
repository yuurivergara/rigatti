import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'catalogo.theme';

/**
 * O atributo no <html> é a fonte da verdade — ele já vem definido pelo script
 * inline do index.html, antes da primeira pintura. Guardar o tema em `useState`
 * daria estado divergente entre as instâncias do botão (uma por layout).
 */
const listeners = new Set<() => void>();

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};

const getTheme = (): Theme => (document.documentElement.dataset.theme as Theme) ?? 'light';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  for (const notify of listeners) notify();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme);
  const toggle = useCallback(() => applyTheme(getTheme() === 'dark' ? 'light' : 'dark'), []);

  return { theme, toggle };
}
