import type { Repos } from '@/lib/types.js';

import { createInMemoryTasksAdapter } from './tasks.js';

/**
 * builds all in-memory repo adapters. each call returns fresh stores,
 * call this inside buildClient() (or beforeEach) for test isolation
 *
 * when adding a new repository:
 *   1. create src/tests/in-memory/<resource>.ts
 *   2. import createInMemoryXxxAdapter here
 *   3. add xxx: createInMemoryXxxAdapter() below
 */
export function createInMemoryRepos(): Repos {
  return {
    tasks: createInMemoryTasksAdapter()
  };
}
