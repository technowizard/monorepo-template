import { logger } from '@/lib/logger.js';
import { errorResponse, HttpStatus, successResponse } from '@/lib/response.js';
import type { AppRouteHandler } from '@/lib/types.js';

import { tasksService } from '@/services/tasks.service.js';

import type {
  CreateTaskRoute,
  DeleteTaskRoute,
  GetTaskRoute,
  GetTasksRoute,
  UpdateTaskRoute
} from './tasks.routes.js';

export const getTasks: AppRouteHandler<GetTasksRoute> = async (c) => {
  const tasks = await tasksService.findAll();

  const response = successResponse(tasks);

  return c.json(response, response.status);
};

export const getTask: AppRouteHandler<GetTaskRoute> = async (c) => {
  const { id } = c.req.valid('param');

  const task = await tasksService.findById(id);

  if (!task) {
    const response = errorResponse('Task not found', HttpStatus.NOT_FOUND);

    return c.json(response, response.status);
  }

  const response = successResponse(task, 'Task retrieved successfully');

  return c.json(response, response.status);
};

export const createTask: AppRouteHandler<CreateTaskRoute> = async (c) => {
  const data = c.req.valid('json');

  if (!data) {
    const response = errorResponse('Invalid request data', HttpStatus.BAD_REQUEST);

    return c.json(response, response.status);
  }

  const task = await tasksService.create(data);

  const response = successResponse(task, 'Task created successfully', HttpStatus.CREATED);

  return c.json(response, response.status);
};

export const updateTask: AppRouteHandler<UpdateTaskRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  try {
    const taskExists = await tasksService.findById(id);

    if (!taskExists) {
      const response = errorResponse('Task not found', HttpStatus.NOT_FOUND);

      return c.json(response, response.status);
    }

    if (Object.keys(body).length === 0) {
      const response = errorResponse('Invalid request data', HttpStatus.UNPROCESSABLE_ENTITY);

      return c.json(response, response.status);
    }

    const updatedTask = await tasksService.update(id, body);

    if (!updatedTask) {
      const response = errorResponse('Failed to update task', HttpStatus.INTERNAL_SERVER_ERROR);

      return c.json(response, response.status);
    }

    const response = successResponse(updatedTask, 'Task updated successfully');

    return c.json(response, response.status);
  } catch {
    const response = errorResponse('An error occurred when updating the task');

    return c.json(response, response.status);
  }
};

export const deleteTask: AppRouteHandler<DeleteTaskRoute> = async (c) => {
  const { id } = c.req.valid('param');

  try {
    const taskExists = await tasksService.findById(id);

    if (!taskExists) {
      const response = errorResponse('Task not found', HttpStatus.NOT_FOUND);

      return c.json(response, response.status);
    }

    const success = await tasksService.delete(id);

    if (success) {
      const response = successResponse({ id }, 'Task deleted successfully');

      return c.json(response, response.status);
    } else {
      const response = errorResponse('Failed to delete task', HttpStatus.INTERNAL_SERVER_ERROR);

      return c.json(response, response.status);
    }
  } catch (error) {
    const errorMessage = `Error deleting task: ${(error as Error).message}`;

    logger.error(errorMessage);

    const response = errorResponse('An error occurred when deleting the task');

    return c.json(response, response.status);
  }
};
