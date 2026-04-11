import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { TasksPage } from '@/pages/tasks';

const filterSchema = z.object({
  filter: z.enum(['all', 'active', 'done']).catch('all')
});

export const Route = createFileRoute('/')({
  validateSearch: filterSchema,
  component: TasksPage
});
