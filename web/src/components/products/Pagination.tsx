import { Button } from '../ui/Button';

type Props = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Paginação">
      <Button size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span className="numeric text-xs text-ink-soft">
        {String(page).padStart(2, '0')} / {String(pages).padStart(2, '0')}
      </span>
      <Button size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Próxima
      </Button>
    </nav>
  );
}
