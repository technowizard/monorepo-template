import { eq } from 'drizzle-orm';

import { db } from '@/db/index.js';
import { tasksTable } from '@/db/schemas/tasks.js';

import { logger } from '@/lib/logger.js';

export const tasksRepository = {
  findAll: async () => {
    return await db.select().from(tasksTable);
  },
  findById: async (id: string) => {
    const task = await db.query.tasksTable.findFirst({
      where: (fields, operators) => operators.eq(fields.id, id)
    });

    if (!task) {
      logger.warn(`Task not found: ${id}`);

      return null;
    }

    return task;
  },
  create: async (data: { name: string }) => {
    const [createdTask] = await db.insert(tasksTable).values(data).returning();

    if (!createdTask) {
      throw new Error('Failed to create task');
    }

    return createdTask;
  },
  update: async (id: string, data: Partial<{ name: string; completed: boolean }>) => {
    const [updatedTask] = await db
      .update(tasksTable)
      .set(data)
      .where(eq(tasksTable.id, id))
      .returning();

    return updatedTask;
  },
  delete: async (id: string) => {
    const [deleted] = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();

    return deleted;
  }
};
