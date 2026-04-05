import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { toZodOpenApiSchema } from '@/lib/zod-utils.js';

export const tasksTable = pgTable('tasks', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string'
  })
    .notNull()
    .defaultNow()
});

export const selectTasksSchema = toZodOpenApiSchema(createSelectSchema(tasksTable));

export const insertTasksSchema = toZodOpenApiSchema(
  createInsertSchema(tasksTable, {
    name: (field) => field.min(1).max(100)
  })
    .required({
      name: true
    })
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true
    })
);

export const updateTasksSchema = toZodOpenApiSchema(
  createUpdateSchema(tasksTable, {
    name: (field) => field.min(1).max(100)
  }).omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
);
