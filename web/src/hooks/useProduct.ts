import { useCallback, useEffect, useState } from 'react';
import { productsApi } from '../api/products.api';
import { errorMessage } from '../api/http';
import type { Product } from '../api/types';

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setProduct(await productsApi.get(id));
    } catch (err) {
      setError(errorMessage(err, 'Produto não encontrado'));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { product, loading, error, reload };
}
