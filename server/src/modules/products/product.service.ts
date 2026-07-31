import type { FilterQuery } from 'mongoose';
import { Product, type ProductDoc } from './product.model.js';
import { notFound } from '../../lib/http-error.js';
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductsInput,
} from './product.schemas.js';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildFilter(input: Pick<ListProductsInput, 'search' | 'category' | 'minPrice' | 'maxPrice'>) {
  const filter: FilterQuery<ProductDoc> = {};

  if (input.search) {
    const rx = new RegExp(escapeRegex(input.search), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
  }
  if (input.category) filter.category = new RegExp(`^${escapeRegex(input.category)}$`, 'i');
  if (input.minPrice !== undefined || input.maxPrice !== undefined) {
    filter.price = {
      ...(input.minPrice !== undefined && { $gte: input.minPrice }),
      ...(input.maxPrice !== undefined && { $lte: input.maxPrice }),
    };
  }
  return filter;
}

export async function list(input: ListProductsInput) {
  const filter = buildFilter(input);
  const skip = (input.page - 1) * input.limit;

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(input.limit),
    Product.countDocuments(filter),
  ]);

  return { items, total, page: input.page, limit: input.limit, pages: Math.ceil(total / input.limit) };
}

export async function getById(id: string) {
  const product = await Product.findById(id);
  if (!product) throw notFound('Produto não encontrado');
  return product;
}

export async function create(input: CreateProductInput) {
  return Product.create(input);
}

export async function update(id: string, input: UpdateProductInput) {
  const product = await Product.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!product) throw notFound('Produto não encontrado');
  return product;
}

export async function remove(id: string) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw notFound('Produto não encontrado');
}

export async function categories(): Promise<string[]> {
  return Product.distinct('category');
}
