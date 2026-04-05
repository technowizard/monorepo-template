// src/tests/setup.ts — runs before each test file
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { afterAll } from 'vitest';

import { env } from '@/lib/env-config.js';

import { cleanDatabase } from './helpers.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool);

afterAll(async () => {
  await cleanDatabase(db);
});
