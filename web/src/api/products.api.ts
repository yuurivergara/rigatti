import { jsonBody, request, toQueryString } from './http';
import type { Product, ProductInput, ProductPage, ProductQuery } from './types';

export const productsApi = {
  list: (query: ProductQuery) => request<ProductPage>(`/api/products?${toQueryString(query)}`),

  get: (id: string) => request<Product>(`/api/products/${id}`),

  categories: () => request<string[]>('/api/products/categories'),

  create: (input: ProductInput) =>
    request<Product>('/api/products', { method: 'POST', body: jsonBody(input) }),

  update: (id: string, input: Partial<ProductInput>) =>
    request<Product>(`/api/products/${id}`, { method: 'PATCH', body: jsonBody(input) }),

  remove: (id: string) => request<void>(`/api/products/${id}`, { method: 'DELETE' }),

  uploadImage: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return request<{ url: string }>('/api/images', { method: 'POST', body });
  },
};
