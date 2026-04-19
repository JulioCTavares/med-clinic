import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  DATABASE_URL: z.url('DATABASE_URL deve ser uma URL válida'),
  DATABASE_URL_E2E: z.url().optional(),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter no mínimo 16 caracteres'),
  JWT_EXPIRES_IN: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(16, 'REFRESH_TOKEN_SECRET deve ter no mínimo 16 caracteres'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET deve ter no mínimo 16 caracteres'),
  CORS_ORIGIN: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues
      .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${formatted}`);
  }

  return result.data;
}
