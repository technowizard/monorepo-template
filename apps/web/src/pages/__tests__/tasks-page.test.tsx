import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { defaultTasks } from '@/tests/mocks/handlers';
import { server } from '@/tests/mocks/server';
import { renderPage, screen, waitFor } from '@/tests/test-utils';

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() })
}));

describe('TasksPage', () => {
  it('shows the tasks heading', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: /tasks/i })).toBeInTheDocument();
  });

  it('loads and displays tasks from the API', async () => {
    renderPage();

    expect(await screen.findByText('buy groceries')).toBeInTheDocument();
    expect(screen.getByText('fix bug')).toBeInTheDocument();
    expect(screen.getByText('write tests')).toBeInTheDocument();
  });

  it('shows correct active task count', async () => {
    renderPage();

    // defaultTasks has 2 active, 1 completed
    expect(await screen.findByText('2 remaining')).toBeInTheDocument();
  });

  it('shows loading skeleton before data arrives', async () => {
    server.use(
      http.get('http://localhost:3000/tasks', async () => {
        await new Promise((r) => setTimeout(r, 200));

        return HttpResponse.json({ result: defaultTasks, message: 'ok', status: 200 });
      })
    );

    const { container } = renderPage();

    // router mounts the page asynchronously, wait for the skeleton to appear
    await waitFor(() =>
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    );
    expect(await screen.findByText('buy groceries')).toBeInTheDocument();
  });

  it('shows error state when GET /tasks fails', async () => {
    server.use(
      http.get('http://localhost:3000/tasks', () => {
        return HttpResponse.json({ message: 'server error', status: 500 }, { status: 500 });
      })
    );

    renderPage();

    expect(await screen.findByText('failed to load tasks.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('filters to active tasks when "active" tab is clicked', async () => {
    renderPage();
    await screen.findByText('buy groceries');

    await userEvent.click(screen.getByRole('button', { name: /active/i }));

    expect(screen.getByText('buy groceries')).toBeInTheDocument();
    expect(screen.getByText('fix bug')).toBeInTheDocument();
    expect(screen.queryByText('write tests')).not.toBeInTheDocument();
  });

  it('filters to done tasks when "done" tab is clicked', async () => {
    renderPage();
    await screen.findByText('buy groceries');

    await userEvent.click(screen.getByRole('button', { name: /done/i }));

    expect(screen.queryByText('buy groceries')).not.toBeInTheDocument();
    expect(screen.getByText('write tests')).toBeInTheDocument();
  });

  it('shows empty state when active filter has no matches', async () => {
    server.use(
      http.get('http://localhost:3000/tasks', () => {
        return HttpResponse.json({ result: [{ ...defaultTasks[2] }], message: 'ok', status: 200 });
      })
    );

    renderPage();
    await screen.findByText('write tests');

    await userEvent.click(screen.getByRole('button', { name: /active/i }));

    expect(screen.getByText('no active tasks.')).toBeInTheDocument();
  });

  it('adds a new task via the create form', async () => {
    const createdTask = {
      id: '99',
      name: 'new task',
      completed: false,
      createdAt: '',
      updatedAt: ''
    };

    // Re-fetch returns updated list after creation
    let callCount = 0;
    server.use(
      http.get('http://localhost:3000/tasks', () => {
        callCount++;
        const tasks = callCount === 1 ? defaultTasks : [...defaultTasks, createdTask];

        return HttpResponse.json({ result: tasks, message: 'ok', status: 200 });
      }),
      http.post('http://localhost:3000/tasks', async () => {
        return HttpResponse.json(
          { result: createdTask, message: 'created', status: 201 },
          { status: 201 }
        );
      })
    );

    renderPage();
    await screen.findByText('buy groceries');

    await userEvent.type(screen.getByPlaceholderText('add a task...'), 'new task');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => expect(screen.getByText('new task')).toBeInTheDocument());
  });
});
