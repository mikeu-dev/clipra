import { z } from 'zod';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess((val) => val ?? '3000', z.coerce.number().default(3000)),
  PROXY_URL: z.string().optional(),
  BROWSER_HEADLESS: z.preprocess(
    (val) => val ?? 'true',
    z.string().transform((val) => val !== 'false')
  ).default(true),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
