import { testClient } from 'hono/testing';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { createTestApp } from '@/lib/create-app.js';
import { HttpStatus } from '@/lib/response.js';

import router from './tasks.index.js';

const client = testClient(createTestApp(router));

describe('tasks routes', () => {
  it('post /tasks returns 422 with field errors on invalid body', async () => {
    const response = await client.tasks.$post({
      json: {
        completed: false
      }
    });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
      const body = await response.json();

      expect(body).toMatchObject({
        message: 'Validation failed',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          name: expect.any(String)
        }
      });

      expect(body.errors).toHaveProperty('name');

      expect(body.errors).not.toHaveProperty('_errors');
      expect(body).not.toHaveProperty('issues');
    }
  });

  let id = '';
  const name = 'Task name';
  const nonExistentId = crypto.randomUUID(); // generate a non-existent id

  it('post /tasks creates a task successfully', async () => {
    const response = await client.tasks.$post({
      json: {
        name,
        completed: false
      }
    });

    expect(response.status).toBe(HttpStatus.CREATED);

    if (response.status === HttpStatus.CREATED) {
      const body = await response.json();

      id = body.result.id;

      expect(body.result.name).toBe(name);
      expect(body.result.completed).toBe(false);
    }
  });

  it('get /tasks returns a list of tasks', async () => {
    const response = await client.tasks.$get();

    expect(response.status).toBe(HttpStatus.OK);

    if (response.status === HttpStatus.OK) {
      const body = await response.json();

      expectTypeOf(body.result).toBeArray();
      expect(body.result.length).toBeGreaterThan(0);
    }
  });

  it('get /tasks/{id} returns 422 with field errors on invalid param', async () => {
    const response = await client.tasks[':id'].$get({
      param: {
        id: 'invalid-id'
      }
    });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
      const body = await response.json();

      expect(body.errors).toHaveProperty('id');
      expect(body.errors!.id).toContain('Invalid UUID');

      expect(body.errors).not.toHaveProperty('_errors');
      expect(body).not.toHaveProperty('issues');
    }
  });

  it('get /tasks/{id} returns 404 when task not found', async () => {
    const response = await client.tasks[':id'].$get({
      param: {
        id: nonExistentId
      }
    });

    expect(response.status).toBe(HttpStatus.NOT_FOUND);

    if (response.status === HttpStatus.NOT_FOUND) {
      const body = await response.json();

      expect(body.message).toBe('Task not found');
    }
  });

  it('get /tasks/{id} returns a task by id', async () => {
    const response = await client.tasks[':id'].$get({
      param: {
        id
      }
    });

    expect(response.status).toBe(HttpStatus.OK);

    if (response.status === HttpStatus.OK) {
      const body = await response.json();

      expect(body.result.id).toBe(id);
      expect(body.result.name).toBe(name);
      expect(body.result.completed).toBe(false);
    }
  });

  it('patch /tasks/{id} returns 422 with field errors on invalid body', async () => {
    const response = await client.tasks[':id'].$patch({
      param: {
        id
      },
      json: {
        name: ''
      }
    });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
      const body = await response.json();

      expect(body.errors).toHaveProperty('name');
      expect(body.errors!.name).toContain('Too small');

      expect(body.errors).not.toHaveProperty('_errors');
      expect(body).not.toHaveProperty('issues');
    }
  });

  it('patch /tasks/{id} returns 422 with field errors on invalid param', async () => {
    const response = await client.tasks[':id'].$patch({
      param: {
        id: 'invalid-id'
      },
      json: {}
    });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
      const body = await response.json();

      expect(body.errors).toHaveProperty('id');
      expect(body.errors!.id).toContain('Invalid UUID');

      expect(body.errors).not.toHaveProperty('_errors');
      expect(body).not.toHaveProperty('issues');
    }
  });

  it('patch /tasks/{id} returns 422 when sending empty body', async () => {
    const response = await client.tasks[':id'].$patch({
      param: {
        id
      },
      json: {}
    });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
      const body = await response.json();

      expect(body.errors).toBeNull();
      expect(body.message).toContain('Invalid request data');
    }
  });

  it('patch /tasks/{id} updates task to completed', async () => {
    const response = await client.tasks[':id'].$patch({
      param: {
        id
      },
      json: {
        completed: true
      }
    });

    expect(response.status).toBe(HttpStatus.OK);

    if (response.status === HttpStatus.OK) {
      const body = await response.json();

      expect(body.result.completed).toBe(true);
    }
  });

  it('delete /tasks/{id} returns 422 with field errors on invalid param', async () => {
    const response = await client.tasks[':id'].$delete({
      param: {
        id: 'invalid-id'
      }
    });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
      const body = await response.json();

      expect(body.errors).toHaveProperty('id');
      expect(body.errors!.id).toContain('Invalid UUID');

      expect(body.errors).not.toHaveProperty('_errors');
      expect(body).not.toHaveProperty('issues');
    }
  });

  it('delete /tasks/{id} deletes task', async () => {
    const response = await client.tasks[':id'].$delete({
      param: {
        id
      }
    });

    expect(response.status).toBe(HttpStatus.OK);

    if (response.status === HttpStatus.OK) {
      const body = await response.json();

      expect(body.result.id).toBe(id);
    }
  });

  it('delete /tasks/{id} returns 404 on non-existent task', async () => {
    const response = await client.tasks[':id'].$delete({
      param: {
        id
      }
    });

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
