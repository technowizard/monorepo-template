import configureOpenAPI from './lib/configure-open-api.js';
import createApp from './lib/create-app.js';

import health from './routes/health/health.index.js';
import tasks from './routes/tasks/tasks.index.js';

const app = createApp();

configureOpenAPI(app);

const routes = [health, tasks] as const;

routes.forEach((route) => {
  app.route('/', route);
});

export type AppType = (typeof routes)[number];

export default app;
