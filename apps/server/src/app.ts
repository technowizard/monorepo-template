import { db } from './db/index.js';

import configureOpenAPI from './lib/configure-open-api.js';
import createApp from './lib/create-app.js';

import { createDrizzleTasksAdapter } from './repositories/tasks.repository.js';

import health from './routes/health/health.index.js';
import tasks from './routes/tasks/tasks.index.js';

const app = createApp();

const repos = {
  tasks: createDrizzleTasksAdapter(db)
  // future repos added here: users: createDrizzleUsersAdapter(db)
};

app.use('*', async (c, next) => {
  c.set('repos', repos);

  return next();
});

configureOpenAPI(app);

const router = app.route('/', health).route('/', tasks);

export type AppType = typeof router;

export default app;
