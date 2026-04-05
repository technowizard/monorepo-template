import { rateLimiter } from 'hono-rate-limiter';

import { env } from '../lib/env-config.js';

export const rateLimit = rateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-6',
  keyGenerator: (c) =>
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? 'unknown'
});
