import { createRouter } from '@/lib/create-app.js';

import * as handlers from './tasks.handlers.js';
import * as routes from './tasks.routes.js';

const router = createRouter()
  .openapi(routes.getTasks, handlers.getTasks)
  .openapi(routes.getTask, handlers.getTask)
  .openapi(routes.createTask, handlers.createTask)
  .openapi(routes.updateTask, handlers.updateTask)
  .openapi(routes.deleteTask, handlers.deleteTask);

export default router;
