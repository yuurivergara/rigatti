import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/authenticate.js';
import * as products from './product.service.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
} from './product.schemas.js';

export const productRouter = Router();

productRouter.use(authenticate);

productRouter.get('/', async (req, res) => {
  res.json(await products.list(listProductsSchema.parse(req.query)));
});

productRouter.get('/categories', async (_req, res) => {
  res.json(await products.categories());
});

productRouter.get('/:id', async (req, res) => {
  res.json(await products.getById(String(req.params.id)));
});

productRouter.post('/', requireRole('admin'), async (req, res) => {
  res.status(201).json(await products.create(createProductSchema.parse(req.body)));
});

productRouter.patch('/:id', requireRole('admin'), async (req, res) => {
  res.json(await products.update(String(req.params.id), updateProductSchema.parse(req.body)));
});

productRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  await products.remove(String(req.params.id));
  res.status(204).end();
});
