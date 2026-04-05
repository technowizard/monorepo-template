import process from 'node:process';

import dotenv from 'dotenv';
import * as z from 'zod';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const envSchema = z.object({
  HOST: z.string().min(1).default('localhost'),

  PORT: z.coerce.number().int().positive().default(3000),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

  CORS_ORIGINS: z.union([z.url(), z.literal('*')]).default('http://localhost:3001'),

  DATABASE_HOST: z.string().default('localhost'),

  DATABASE_PORT: z.coerce.number().int().positive().default(5432),

  DATABASE_USER: z.string(),

  DATABASE_PASSWORD: z.string(), // minimum of 16 characters are recommended

  DATABASE_DB: z.string().default('postgres'),

  DATABASE_URL: z.string().default(''),

  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(50),

  BODY_SIZE_LIMIT: z.coerce.number().int().positive().default(102_400)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid env provided.
The following variables are missing or invalid:
${Object.entries(z.flattenError(parsedEnv.error).fieldErrors)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}
`
  );
}

const envData = parsedEnv.data;

const DATABASE_URL = `postgresql://${envData.DATABASE_USER}:${envData.DATABASE_PASSWORD}@${envData.DATABASE_HOST}:${envData.DATABASE_PORT}/${envData.DATABASE_DB}`;

export type Env = z.infer<typeof envSchema>;

export const env = {
  ...envData,
  DATABASE_URL,
  isDevelopment: envData.NODE_ENV === 'development',
  isProduction: envData.NODE_ENV === 'production',
  isTest: envData.NODE_ENV === 'test'
};
