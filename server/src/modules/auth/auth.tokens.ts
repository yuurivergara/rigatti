import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { unauthorized } from '../../lib/http-error.js';
import type { Role } from './user.model.js';

export type AuthClaims = {
  sub: string;
  companyId: string;
  companyName: string;
  role: Role;
  name: string;
  email: string;
};

export function signToken(claims: AuthClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'rigatti-api',
  } as SignOptions);
}

export function verifyToken(token: string): AuthClaims {
  try {
    return jwt.verify(token, env.JWT_SECRET, { issuer: 'rigatti-api' }) as AuthClaims;
  } catch {
    throw unauthorized('Token inválido ou expirado');
  }
}
