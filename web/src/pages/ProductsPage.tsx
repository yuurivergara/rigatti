import { useState } from 'react';
import type { Product } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { useProductCatalog } from '../hooks/useProductCatalog';
import { PageHeader } from '../components/layout/AppShell';
import { Pagination } from '../components/products/Pagination';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { Button } from '../components/ui/Button';
import { Alert, EmptyState } from '../components/ui/Feedback';
import { pluralize } from '../lib/format';

/** `null` abre o formulário vazio; um produto abre em edição; `undefined` mantém fechado. */
type EditorTarget = Product | null | undefined;

export function ProductsPage() {
  const { isAdmin } = useAuth();
  const { filters, pagination, data, loading, error, reload, remove } = useProductCatalog();
  const [editorTarget, setEditorTarget] = useState<EditorTarget>(undefined);

  async function confirmDelete(product: Product) {
    if (!window.confirm(`Excluir "${product.name}" do catálogo?`)) return;
    await remove(product);
  }

  return (
    <>
      <PageHeader
        title="Catálogo"
        subtitle={
          data
            ? `${pluralize(data.total, 'produto', 'produtos')}${isAdmin ? '' : ' · somente leitura'}`
            : 'Carregando…'
        }
        actions={
          isAdmin && (
            <Button variant="primary" onClick={() => setEditorTarget(null)}>
              Novo produto
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-5 py-6 md:px-7">
        <ProductFilters
          search={filters.search}
          onSearchChange={filters.setSearch}
          category={filters.category}
          onCategoryChange={filters.setCategory}
          categories={filters.categories}
        />

        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}

        {loading && !data && <EmptyState title="Carregando produtos…" />}

        {data && data.items.length === 0 && (
          <EmptyState
            title="Nenhum produto encontrado"
            description={
              filters.search || filters.category
                ? 'Ajuste a busca ou limpe os filtros.'
                : isAdmin
                  ? 'Cadastre o primeiro produto para o assistente ter o que consultar.'
                  : 'A sua empresa ainda não cadastrou produtos.'
            }
          />
        )}

        {data && data.items.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
            {data.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canManage={isAdmin}
                onEdit={setEditorTarget}
                onDelete={(target) => void confirmDelete(target)}
              />
            ))}
          </div>
        )}

        {data && (
          <Pagination page={pagination.page} pages={data.pages} onChange={pagination.setPage} />
        )}
      </div>

      {editorTarget !== undefined && (
        <ProductFormModal
          product={editorTarget}
          categories={filters.categories}
          onClose={() => setEditorTarget(undefined)}
          onSaved={() => {
            setEditorTarget(undefined);
            void reload();
          }}
        />
      )}
    </>
  );
}
