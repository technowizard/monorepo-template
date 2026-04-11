import type { AppType } from '@monorepo-template/api-contract';
import { hc } from 'hono/client';

import { env } from './env';

export const apiClient = hc<AppType>(env.API_URL, {
  init: { credentials: 'include' }
});

export type ApiClient = typeof apiClient;
