import type { Product } from '../../api/types';
import { formatAmount, formatCount } from '../../lib/format';
import { Button } from '../ui/Button';

type Props = {
  product: Product;
  canManage: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductCard({ product, canManage, onEdit, onDelete }: Props) {
  const available = product.active && product.stock > 0;

  return (
    <article className="flex flex-col border border-rule bg-surface transition-colors hover:border-rule-strong">
      <div className="aspect-4/3 overflow-hidden bg-paper">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center font-mono text-xs text-ink-soft">
            sem imagem
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="eyebrow">{product.category}</p>
        <h3 className="font-display text-[15px] leading-snug font-semibold">{product.name}</h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{product.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 rule-top pt-3">
          <p className="numeric text-xl leading-none font-semibold text-signal">
            <span className="text-[0.65em] text-ink-soft">R$ </span>
            {formatAmount(product.price)}
          </p>
          <p className="numeric text-[11px] text-ink-soft">
            {available ? `${formatCount(product.stock)} un.` : 'indisponível'}
          </p>
        </div>
      </div>

      {canManage && (
        <div className="flex gap-2 border-t border-rule p-3">
          <Button size="sm" className="flex-1" onClick={() => onEdit(product)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" className="flex-1" onClick={() => onDelete(product)}>
            Excluir
          </Button>
        </div>
      )}
    </article>
  );
}
