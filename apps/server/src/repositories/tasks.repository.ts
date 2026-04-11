import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { z } from 'zod';

import type * as schema from '@/db/schemas/index.js';
import type {
  insertTasksSchema,
  selectTasksSchema,
  updateTasksSchema
} from '@/db/schemas/tasks.js';
import { tasksTable } from '@/db/schemas/tasks.js';

import { logger } from '@/lib/logger.js';

type Task = z.infer<typeof selectTasksSchema>;
type InsertTask = z.infer<typeof insertTasksSchema>;
type UpdateTask = z.infer<typeof updateTasksSchema>;

export interface TasksRepository {
  findAll: () => Promise<Task[]>;
  findById: (id: string) => Promise<Task | null>;
  create: (data: InsertTask) => Promise<Task>;
  update: (id: string, data: UpdateTask) => Promise<Task | undefined>;
  delete: (id: string) => Promise<Task | undefined>;
}

export function createDrizzleTasksAdapter(db: NodePgDatabase<typeof schema>): TasksRepository {
  return {
    findAll: async () => {
      return await db.select().from(tasksTable);
    },
    findById: async (id) => {
      const task = await db.query.tasksTable.findFirst({
        where: (fields, { eq }) => eq(fields.id, id)
      });

      if (!task) {
        logger.warn(`Task not found: ${id}`);

        return null;
      }

      return task;
    },
    create: async (data) => {
      const [createdTask] = await db.insert(tasksTable).values(data).returning();

      if (!createdTask) {
        throw new Error('Failed to create task');
      }

      return createdTask;
    },
    update: async (id, data) => {
      const [updatedTask] = await db
        .update(tasksTable)
        .set(data)
        .where(eq(tasksTable.id, id))
        .returning();

      return updatedTask;
    },
    delete: async (id) => {
      const [deleted] = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();

      return deleted;
    }
  };
}
