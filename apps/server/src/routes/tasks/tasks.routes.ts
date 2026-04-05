import { createRoute, z } from '@hono/zod-openapi';

import { insertTasksSchema, selectTasksSchema, updateTasksSchema } from '@/db/schemas/tasks.js';

import { jsonContent, jsonContentRequired } from '@/lib/openapi.js';
import { errorResponseSchema, HttpStatus, successResponseSchema } from '@/lib/response.js';

const tags = ['Tasks'];

export const getTasks = createRoute({
  tags,
  method: 'get',
  path: '/tasks',
  responses: {
    [HttpStatus.OK]: jsonContent(
      successResponseSchema(z.array(selectTasksSchema)),
      'The list of tasks'
    )
  }
});

export const getTask = createRoute({
  tags,
  method: 'get',
  path: '/tasks/{id}',
  request: {
    params: z.object({
      id: z.uuid().openapi({
        param: {
          name: 'id',
          in: 'path',
          required: true
        },
        required: ['id'],
        example: '61594536-3742-4ebc-bff8-b2cf6de045bb'
      })
    })
  },
  responses: {
    [HttpStatus.OK]: jsonContent(successResponseSchema(selectTasksSchema), 'The task'),
    [HttpStatus.NOT_FOUND]: jsonContent(
      errorResponseSchema(HttpStatus.NOT_FOUND),
      'Task not found'
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      errorResponseSchema(HttpStatus.UNPROCESSABLE_ENTITY),
      'Validation error'
    )
  }
});

export const createTask = createRoute({
  tags,
  method: 'post',
  path: '/tasks',
  request: {
    body: jsonContentRequired(insertTasksSchema, 'The task to create')
  },
  responses: {
    [HttpStatus.CREATED]: jsonContent(successResponseSchema(selectTasksSchema), 'The created task'),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      errorResponseSchema(HttpStatus.UNPROCESSABLE_ENTITY),
      'Validation error'
    ),
    [HttpStatus.BAD_REQUEST]: jsonContent(
      errorResponseSchema(HttpStatus.BAD_REQUEST),
      'Invalid request data'
    )
  }
});

export const updateTask = createRoute({
  tags,
  method: 'patch',
  path: '/tasks/{id}',
  request: {
    params: z.object({
      id: z.uuid().openapi({
        param: {
          name: 'id',
          in: 'path',
          required: true
        },
        required: ['id'],
        example: '61594536-3742-4ebc-bff8-b2cf6de045bb'
      })
    }),
    body: jsonContentRequired(updateTasksSchema, 'The task updates')
  },
  responses: {
    [HttpStatus.OK]: jsonContent(successResponseSchema(selectTasksSchema), 'The updated task'),
    [HttpStatus.NOT_FOUND]: jsonContent(
      errorResponseSchema(HttpStatus.NOT_FOUND),
      'Task not found'
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      errorResponseSchema(HttpStatus.UNPROCESSABLE_ENTITY),
      'Validation error'
    ),
    [HttpStatus.BAD_REQUEST]: jsonContent(
      errorResponseSchema(HttpStatus.BAD_REQUEST),
      'Invalid request data'
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
      errorResponseSchema(HttpStatus.INTERNAL_SERVER_ERROR),
      'Internal server error'
    )
  }
});

export const deleteTask = createRoute({
  tags,
  method: 'delete',
  path: '/tasks/{id}',
  request: {
    params: z.object({
      id: z.uuid().openapi({
        param: {
          name: 'id',
          in: 'path',
          required: true
        },
        required: ['id'],
        example: '61594536-3742-4ebc-bff8-b2cf6de045bb'
      })
    })
  },
  responses: {
    [HttpStatus.OK]: jsonContent(successResponseSchema(z.object({ id: z.uuid() })), 'Task deleted'),
    [HttpStatus.NOT_FOUND]: jsonContent(
      errorResponseSchema(HttpStatus.NOT_FOUND),
      'Task not found'
    ),
    [HttpStatus.UNPROCESSABLE_ENTITY]: jsonContent(
      errorResponseSchema(HttpStatus.UNPROCESSABLE_ENTITY),
      'Validation error'
    ),
    [HttpStatus.INTERNAL_SERVER_ERROR]: jsonContent(
      errorResponseSchema(HttpStatus.INTERNAL_SERVER_ERROR),
      'Internal server error'
    )
  }
});

export type GetTasksRoute = typeof getTasks;
export type GetTaskRoute = typeof getTask;
export type CreateTaskRoute = typeof createTask;
export type UpdateTaskRoute = typeof updateTask;
export type DeleteTaskRoute = typeof deleteTask;
