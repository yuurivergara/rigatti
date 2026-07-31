import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOrigins } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { productRouter } from './modules/products/product.routes.js';
import { imageRouter } from './modules/images/image.routes.js';
import { chatRouter } from './modules/chat/chat.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/images', imageRouter);
  app.use('/api/chat', chatRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
