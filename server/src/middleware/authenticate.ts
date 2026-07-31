import type { RequestHandler } from 'express';
import { verifyToken, type AuthClaims } from '../modules/auth/auth.tokens.js';
import { runInTenant } from '../tenant/context.js';
import { forbidden, unauthorized } from '../lib/http-error.js';
import type { Role } from '../modules/auth/user.model.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('Envie o header Authorization: Bearer <token>'));
  }

  const claims = verifyToken(header.slice('Bearer '.length).trim());
  req.auth = claims;

  runInTenant(claims.companyId, next);
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) return next(unauthorized());
    if (!roles.includes(req.auth.role)) {
      return next(forbidden('Esta ação requer perfil de administrador'));
    }
    next();
  };
