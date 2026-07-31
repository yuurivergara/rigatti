import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../api/products.api';
import { errorMessage } from '../api/http';
import { useAuth } from '../auth/useAuth';
import { useProduct } from '../hooks/useProduct';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { ProductGallery } from '../components/products/ProductGallery';
import { SpecList } from '../components/products/SpecList';
import { Button } from '../components/ui/Button';
import { Alert, EmptyState } from '../components/ui/Feedback';
import { formatAmount, formatCount } from '../lib/format';

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { product, loading, error, reload } = useProduct(id);
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function remove() {
    if (!product) return;
    if (!window.confirm(`Excluir "${product.name}" do catálogo?`)) return;
    try {
      await productsApi.remove(product.id);
      navigate('/produtos');
    } catch (err) {
      setActionError(errorMessage(err, 'Não foi possível excluir o produto'));
    }
  }

  function askAssistant() {
    if (!product) return;
    navigate('/chat', { state: { question: `Me fale sobre "${product.name}".` } });
  }

  const available = product ? product.active && product.stock > 0 : false;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-rule bg-surface px-5 py-4 lg:px-7">
        <Link
          to="/produtos"
          className="font-mono text-[11px] text-ink-soft transition-colors hover:text-indigo"
        >
          ← voltar ao catálogo
        </Link>
      </div>

      <div className="px-5 py-6 lg:px-7">
        {loading && <EmptyState title="Carregando produto…" />}

        {!loading && error && (
          <EmptyState title={error} description="Ele pode ter sido removido ou não pertence à sua empresa." />
        )}

        {product && (
          <article className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <div className="self-start">
              <ProductGallery images={product.images} alt={product.name} />
            </div>

            <div className="flex flex-col gap-5">
              <header>
                <p className="eyebrow">{product.category}</p>
                <h1 className="mt-2 text-2xl leading-tight font-semibold">{product.name}</h1>
              </header>

              <p className="border-t border-rule pt-4 text-sm leading-relaxed text-ink-soft">
                {product.description}
              </p>

              <p className="numeric text-4xl leading-none font-semibold text-signal">
                <span className="text-[0.4em] align-super text-ink-soft">R$ </span>
                {formatAmount(product.price)}
              </p>

              <SpecList
                specs={[
                  { label: 'estoque', value: `${formatCount(product.stock)} un.` },
                  { label: 'situação', value: available ? 'disponível' : 'indisponível' },
                  { label: 'categoria', value: product.category },
                  { label: 'cadastrado', value: dateFormat.format(new Date(product.createdAt)) },
                ]}
              />

              {actionError && <Alert>{actionError}</Alert>}

              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={askAssistant}>
                  Perguntar ao assistente
                </Button>
                {isAdmin && (
                  <>
                    <Button onClick={() => setEditing(true)}>Editar</Button>
                    <Button variant="danger" onClick={() => void remove()}>
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          </article>
        )}
      </div>

      {editing && product && (
        <ProductFormModal
          product={product}
          categories={[product.category]}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            void reload();
          }}
        />
      )}
    </div>
  );
}
