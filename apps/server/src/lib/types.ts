import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { Schema } from 'hono';
import type { PinoLogger } from 'hono-pino';

import type { TasksRepository } from '@/repositories/tasks.repository.js';

export interface Repos {
  tasks: TasksRepository;
  // future repos added here: users: UsersRepository; etc.
}

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    repos: Repos;
  };
}

export type AppOpenAPI<S extends Schema = Schema> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
