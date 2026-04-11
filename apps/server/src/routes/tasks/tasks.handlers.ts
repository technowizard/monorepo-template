import { errorResponse, HttpStatus, successResponse } from '@/lib/response.js';
import type { AppRouteHandler } from '@/lib/types.js';

import type {
  CreateTaskRoute,
  DeleteTaskRoute,
  GetTaskRoute,
  GetTasksRoute,
  UpdateTaskRoute
} from './tasks.routes.js';

export const getTasks: AppRouteHandler<GetTasksRoute> = async (c) => {
  const { tasks } = c.get('repos');

  const result = await tasks.findAll();

  const response = successResponse(result);

  return c.json(response, response.status);
};

export const getTask: AppRouteHandler<GetTaskRoute> = async (c) => {
  const { tasks } = c.get('repos');
  const { id } = c.req.valid('param');

  const task = await tasks.findById(id);

  if (!task) {
    const response = errorResponse('Task not found', HttpStatus.NOT_FOUND);

    return c.json(response, response.status);
  }

  const response = successResponse(task, 'Task retrieved successfully');

  return c.json(response, response.status);
};

export const createTask: AppRouteHandler<CreateTaskRoute> = async (c) => {
  const { tasks } = c.get('repos');
  const data = c.req.valid('json');
  const task = await tasks.create(data);

  const response = successResponse(task, 'Task created successfully', HttpStatus.CREATED);

  return c.json(response, response.status);
};

export const updateTask: AppRouteHandler<UpdateTaskRoute> = async (c) => {
  const { tasks } = c.get('repos');
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  if (Object.keys(body).length === 0) {
    const response = errorResponse('Invalid request data', HttpStatus.UNPROCESSABLE_ENTITY);

    return c.json(response, response.status);
  }

  const updatedTask = await tasks.update(id, body);

  if (!updatedTask) {
    const response = errorResponse('Task not found', HttpStatus.NOT_FOUND);

    return c.json(response, response.status);
  }

  const response = successResponse(updatedTask, 'Task updated successfully');

  return c.json(response, response.status);
};

export const deleteTask: AppRouteHandler<DeleteTaskRoute> = async (c) => {
  const { tasks } = c.get('repos');
  const { id } = c.req.valid('param');

  const deleted = await tasks.delete(id);

  if (!deleted) {
    const response = errorResponse('Task not found', HttpStatus.NOT_FOUND);

    return c.json(response, response.status);
  }

  const response = successResponse({ id }, 'Task deleted successfully');

  return c.json(response, response.status);
};
