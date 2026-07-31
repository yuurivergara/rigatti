import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGO_URI: z.string().min(1, 'MONGO_URI é obrigatória'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa de pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),

  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY é obrigatória'),
  ANTHROPIC_MODEL: z.string().default('claude-opus-5'),

  CORS_ORIGIN: z.string().default('*'),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(2 * 1024 * 1024),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Configuração inválida. Verifique o seu .env:\n${issues}`);
}

export const env = parsed.data;

export const corsOrigins =
  env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean);
