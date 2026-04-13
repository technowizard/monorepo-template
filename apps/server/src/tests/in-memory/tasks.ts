import type { z } from 'zod';

import type { selectTasksSchema } from '@/db/schemas/tasks.js';

import type { TasksRepository } from '@/repositories/tasks.repository.js';

type Task = z.infer<typeof selectTasksSchema>;

export function createInMemoryTasksAdapter(): TasksRepository {
  const store = new Map<string, Task>();

  return {
    findAll: async () => [...store.values()],

    findById: async (id) => store.get(id) ?? null,

    create: async (data) => {
      const task: Task = {
        id: crypto.randomUUID(),
        name: data.name,
        completed: data.completed ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.set(task.id, task);

      return task;
    },

    update: async (id, data) => {
      const existing = store.get(id);

      if (!existing) {
        return undefined;
      }

      const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
      store.set(id, updated);

      return updated;
    },

    delete: async (id) => {
      const existing = store.get(id);

      if (!existing) {
        return undefined;
      }

      store.delete(id);

      return existing;
    }
  };
}
