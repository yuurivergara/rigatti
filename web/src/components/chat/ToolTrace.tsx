import { PulseDot } from '../ui/Feedback';

const TOOL_LABELS: Record<string, string> = {
  search_products: 'consultou o catálogo',
  list_categories: 'listou as categorias',
};

/** Torna visível que a resposta veio do banco, e não da memória do modelo. */
export function ToolTrace({ name }: { name: string }) {
  return (
    <p className="flex items-center gap-2 self-start font-mono text-[11px] text-ink-soft">
      <span aria-hidden>→</span>
      <span>{TOOL_LABELS[name] ?? 'usou uma ferramenta'}</span>
      <span className="border border-rule px-1.5 py-0.5">{name}</span>
    </p>
  );
}

export function ThinkingIndicator() {
  return (
    <p className="flex items-center gap-2 self-start font-mono text-[11px] text-ink-soft">
      <PulseDot />
      consultando…
    </p>
  );
}
