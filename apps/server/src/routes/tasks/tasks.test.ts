import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest';

import { createInMemoryRepos } from '@/tests/in-memory/index.js';

import { createTestApp } from '@/lib/create-app.js';
import { HttpStatus } from '@/lib/response.js';

import router from './tasks.index.js';

function buildClient() {
  const repos = createInMemoryRepos();

  return testClient(
    createTestApp(router, (app) => {
      app.use('*', async (c, next) => {
        c.set('repos', repos);

        return next();
      });
    })
  );
}

const nonExistentId = crypto.randomUUID();
let client: ReturnType<typeof buildClient>;

beforeEach(() => {
  client = buildClient();
});

describe('tasks routes', () => {
  describe('POST /tasks', () => {
    it('returns 422 with field errors on invalid body', async () => {
      const response = await client.tasks.$post({ json: { completed: false } });

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
        const body = await response.json();

        expect(body.errors).toHaveProperty('name');
        expect(body.errors).not.toHaveProperty('_errors');
        expect(body).not.toHaveProperty('issues');
      }
    });

    it('creates a task and returns 201', async () => {
      const response = await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      expect(response.status).toBe(HttpStatus.CREATED);

      if (response.status === HttpStatus.CREATED) {
        const body = await response.json();

        expect(body.result.name).toBe('Task name');
        expect(body.result.completed).toBe(false);
      }
    });
  });

  describe('GET /tasks', () => {
    it('returns a list of tasks', async () => {
      await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      const response = await client.tasks.$get();

      expect(response.status).toBe(HttpStatus.OK);

      if (response.status === HttpStatus.OK) {
        const body = await response.json();

        expectTypeOf(body.result).toBeArray();
        expect(body.result.length).toBeGreaterThan(0);
      }
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns 422 with field errors on invalid param', async () => {
      const response = await client.tasks[':id'].$get({ param: { id: 'invalid-id' } });

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
        const body = await response.json();

        expect(body.errors).toHaveProperty('id');
        expect(body.errors!.id).toContain('Invalid UUID');
        expect(body.errors).not.toHaveProperty('_errors');
        expect(body).not.toHaveProperty('issues');
      }
    });

    it('returns 404 when task not found', async () => {
      const response = await client.tasks[':id'].$get({ param: { id: nonExistentId } });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);

      if (response.status === HttpStatus.NOT_FOUND) {
        const body = await response.json();

        expect(body.message).toBe('Task not found');
      }
    });

    it('returns a task by id', async () => {
      const created = await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      let taskId = '';

      if (created.status === HttpStatus.CREATED) {
        const body = await created.json();

        taskId = body.result.id;
      }

      const response = await client.tasks[':id'].$get({ param: { id: taskId } });

      expect(response.status).toBe(HttpStatus.OK);

      if (response.status === HttpStatus.OK) {
        const body = await response.json();

        expect(body.result.id).toBe(taskId);
        expect(body.result.name).toBe('Task name');
      }
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('returns 422 with field errors on invalid body', async () => {
      const created = await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      let taskId = '';

      if (created.status === HttpStatus.CREATED) {
        const body = await created.json();

        taskId = body.result.id;
      }

      const response = await client.tasks[':id'].$patch({
        param: { id: taskId },
        json: { name: '' }
      });

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
        const body = await response.json();

        expect(body.errors).toHaveProperty('name');
        expect(body.errors!.name).toContain('Too small');
      }
    });

    it('returns 422 with field errors on invalid param', async () => {
      const response = await client.tasks[':id'].$patch({ param: { id: 'invalid-id' }, json: {} });

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
        const body = await response.json();

        expect(body.errors).toHaveProperty('id');
        expect(body.errors!.id).toContain('Invalid UUID');
      }
    });

    it('returns 422 when sending empty body', async () => {
      const created = await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      let taskId = '';

      if (created.status === HttpStatus.CREATED) {
        const body = await created.json();

        taskId = body.result.id;
      }

      const response = await client.tasks[':id'].$patch({ param: { id: taskId }, json: {} });

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
        const body = await response.json();

        expect(body.errors).toBeNull();
        expect(body.message).toContain('Invalid request data');
      }
    });

    it('updates task to completed', async () => {
      const created = await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      let taskId = '';

      if (created.status === HttpStatus.CREATED) {
        const body = await created.json();

        taskId = body.result.id;
      }

      const response = await client.tasks[':id'].$patch({
        param: { id: taskId },
        json: { completed: true }
      });

      expect(response.status).toBe(HttpStatus.OK);

      if (response.status === HttpStatus.OK) {
        const body = await response.json();

        expect(body.result.completed).toBe(true);
      }
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('returns 422 with field errors on invalid param', async () => {
      const response = await client.tasks[':id'].$delete({ param: { id: 'invalid-id' } });

      expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

      if (response.status === HttpStatus.UNPROCESSABLE_ENTITY) {
        const body = await response.json();

        expect(body.errors).toHaveProperty('id');
        expect(body.errors!.id).toContain('Invalid UUID');
      }
    });

    it('deletes a task and returns its id', async () => {
      const created = await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      let taskId = '';

      if (created.status === HttpStatus.CREATED) {
        const body = await created.json();

        taskId = body.result.id;
      }

      const response = await client.tasks[':id'].$delete({ param: { id: taskId } });

      expect(response.status).toBe(HttpStatus.OK);

      if (response.status === HttpStatus.OK) {
        const body = await response.json();
        expect(body.result.id).toBe(taskId);
      }
    });

    it('returns 404 on non-existent task', async () => {
      const created = await client.tasks.$post({ json: { name: 'Task name', completed: false } });

      let taskId = '';

      if (created.status === HttpStatus.CREATED) {
        const body = await created.json();

        taskId = body.result.id;
      }

      await client.tasks[':id'].$delete({ param: { id: taskId } });

      const response = await client.tasks[':id'].$delete({ param: { id: taskId } });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
