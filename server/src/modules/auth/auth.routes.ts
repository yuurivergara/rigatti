import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerSchema, loginSchema, inviteSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';
import { authenticate, requireRole } from '../../middleware/authenticate.js';

const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Muitas tentativas. Tente de novo em alguns minutos.' } },
});

export const authRouter = Router();

authRouter.post('/register', credentialsLimiter, async (req, res) => {
  const result = await authService.register(registerSchema.parse(req.body));
  res.status(201).json(result);
});

authRouter.post('/login', credentialsLimiter, async (req, res) => {
  const result = await authService.login(loginSchema.parse(req.body));
  res.json(result);
});

authRouter.get('/me', authenticate, async (req, res) => {
  res.json(await authService.currentSession(req.auth!.sub));
});

authRouter.post('/users', authenticate, requireRole('admin'), async (req, res) => {
  const user = await authService.invite(req.auth!.companyId, inviteSchema.parse(req.body));
  res.status(201).json(user);
});
