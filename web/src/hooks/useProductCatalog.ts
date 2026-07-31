import { useCallback, useEffect, useState } from 'react';
import { productsApi } from '../api/products.api';
import { errorMessage } from '../api/http';
import type { Product, ProductPage } from '../api/types';
import { useDebouncedValue } from './useDebouncedValue';

const PAGE_SIZE = 12;

export function useProductCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ProductPage | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => setPage(1), [debouncedSearch, category]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await productsApi.list({ search: debouncedSearch, category, page, limit: PAGE_SIZE }));
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível carregar os produtos'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => setCategories([]));
  }, [data?.total]);

  const remove = useCallback(
    async (product: Product) => {
      try {
        await productsApi.remove(product.id);
        await reload();
      } catch (err) {
        setError(errorMessage(err, 'Não foi possível excluir o produto'));
      }
    },
    [reload],
  );

  return {
    filters: { search, setSearch, category, setCategory, categories },
    pagination: { page, setPage },
    data,
    loading,
    error,
    reload,
    remove,
  };
}
