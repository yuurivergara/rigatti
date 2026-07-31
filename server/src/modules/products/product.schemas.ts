import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(2000),
  price: z.number().nonnegative(),
  category: z.string().trim().min(2).max(80),
  images: z.array(z.url().max(2048)).max(8, 'Máximo de 8 imagens').default([]),
  stock: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsSchema = z.object({
  search: z.string().trim().max(160).optional(),
  category: z.string().trim().max(80).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;
