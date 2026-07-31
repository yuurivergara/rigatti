import bcrypt from 'bcryptjs';
import { Company, slugify } from '../company/company.model.js';
import { User } from './user.model.js';
import { signToken, type AuthClaims } from './auth.tokens.js';
import { conflict, unauthorized } from '../../lib/http-error.js';
import type { RegisterInput, LoginInput, InviteInput } from './auth.schemas.js';

const BCRYPT_ROUNDS = 12;

export type AuthResult = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
  company: { id: string; name: string };
};

/** Registro cria a empresa e o primeiro usuário, que vira admin dela. */
export async function register(input: RegisterInput): Promise<AuthResult> {
  if (await User.exists({ email: input.email })) {
    throw conflict('E-mail já cadastrado');
  }

  const company = await Company.create({
    name: input.companyName,
    slug: `${slugify(input.companyName)}-${Date.now().toString(36)}`,
  });

  const user = await User.create({
    companyId: company._id,
    name: input.name,
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    role: 'admin',
  });

  return buildResult(user, company);
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  // Compara mesmo sem usuário para não expor por timing quais e-mails existem.
  const hash = user?.passwordHash ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali';
  const ok = await bcrypt.compare(input.password, hash);
  if (!user || !ok) throw unauthorized('Credenciais inválidas');

  const company = await Company.findById(user.companyId);
  if (!company) throw unauthorized('Empresa não encontrada');

  return buildResult(user, company);
}

/**
 * Relê usuário e empresa do banco. O JWT sozinho não basta: um usuário
 * removido continuaria com sessão válida até o token expirar.
 */
export async function currentSession(userId: string): Promise<Omit<AuthResult, 'token'>> {
  const user = await User.findById(userId);
  if (!user) throw unauthorized('Sessão expirada');

  const company = await Company.findById(user.companyId);
  if (!company) throw unauthorized('Empresa não encontrada');

  return {
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    company: { id: String(company._id), name: company.name },
  };
}

/** Criação de usuário dentro da empresa do admin autenticado. */
export async function invite(companyId: string, input: InviteInput) {
  if (await User.exists({ email: input.email })) {
    throw conflict('E-mail já cadastrado');
  }
  return User.create({
    companyId,
    name: input.name,
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    role: input.role,
  });
}

function buildResult(
  user: { _id: unknown; name: string; email: string; role: string; companyId: unknown },
  company: { _id: unknown; name: string },
): AuthResult {
  const claims: AuthClaims = {
    sub: String(user._id),
    companyId: String(user.companyId),
    companyName: company.name,
    role: user.role as AuthClaims['role'],
    name: user.name,
    email: user.email,
  };

  return {
    token: signToken(claims),
    user: { id: claims.sub, name: user.name, email: user.email, role: user.role },
    company: { id: String(company._id), name: company.name },
  };
}
