import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server } from '@/tests/mocks/server';
import { render, screen, waitFor } from '@/tests/test-utils';
import type { Task } from '@/types/api';

import { TaskItem } from '../task-item';

const activeTask: Task = {
  id: '1',
  name: 'buy groceries',
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const completedTask: Task = { ...activeTask, completed: true };

describe('TaskItem', () => {
  it('renders the task name', () => {
    render(<TaskItem task={activeTask} />);

    expect(screen.getByText('buy groceries')).toBeInTheDocument();
  });

  it('renders unchecked checkbox for active task', () => {
    render(<TaskItem task={activeTask} />);

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders checked checkbox for completed task', () => {
    render(<TaskItem task={completedTask} />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('applies strikethrough style for completed task', () => {
    render(<TaskItem task={completedTask} />);

    expect(screen.getByText('buy groceries')).toHaveClass('line-through');
  });

  it('sends PATCH with completed=true when checkbox is clicked', async () => {
    const onPatch = vi.fn();

    server.use(
      http.patch('http://localhost:3000/tasks/1', async ({ request }) => {
        onPatch(await request.json());
        return HttpResponse.json({
          result: { ...activeTask, completed: true },
          message: 'ok',
          status: 200
        });
      })
    );

    render(<TaskItem task={activeTask} />);

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() => expect(onPatch).toHaveBeenCalledWith({ completed: true }));
  });

  it('sends PATCH with completed=false when completed task checkbox is clicked', async () => {
    const onPatch = vi.fn();

    server.use(
      http.patch('http://localhost:3000/tasks/1', async ({ request }) => {
        onPatch(await request.json());
        return HttpResponse.json({
          result: { ...completedTask, completed: false },
          message: 'ok',
          status: 200
        });
      })
    );

    render(<TaskItem task={completedTask} />);

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() => expect(onPatch).toHaveBeenCalledWith({ completed: false }));
  });

  it('enters edit mode when task name is clicked', async () => {
    render(<TaskItem task={activeTask} />);

    await userEvent.click(screen.getByText('buy groceries'));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('buy groceries');
  });

  it('sends PATCH with new name on Enter', async () => {
    const onPatch = vi.fn();

    server.use(
      http.patch('http://localhost:3000/tasks/1', async ({ request }) => {
        onPatch(await request.json());

        return HttpResponse.json({
          result: { ...activeTask, name: 'buy oat milk' },
          message: 'ok',
          status: 200
        });
      })
    );

    render(<TaskItem task={activeTask} />);

    await userEvent.click(screen.getByText('buy groceries'));
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'buy oat milk');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(onPatch).toHaveBeenCalledWith({ name: 'buy oat milk' }));
  });

  it('does not send PATCH when Escape is pressed', async () => {
    const onPatch = vi.fn();

    server.use(
      http.patch('http://localhost:3000/tasks/1', async ({ request }) => {
        onPatch(await request.json());
        return HttpResponse.json({ result: activeTask, message: 'ok', status: 200 });
      })
    );

    render(<TaskItem task={activeTask} />);

    await userEvent.click(screen.getByText('buy groceries'));
    await userEvent.type(screen.getByRole('textbox'), ' extra');
    await userEvent.keyboard('{Escape}');

    expect(onPatch).not.toHaveBeenCalled();
  });

  it('does not send PATCH when value is unchanged', async () => {
    const onPatch = vi.fn();

    server.use(
      http.patch('http://localhost:3000/tasks/1', async ({ request }) => {
        onPatch(await request.json());
        return HttpResponse.json({ result: activeTask, message: 'ok', status: 200 });
      })
    );

    render(<TaskItem task={activeTask} />);

    await userEvent.click(screen.getByText('buy groceries'));
    await userEvent.keyboard('{Enter}');

    expect(onPatch).not.toHaveBeenCalled();
  });

  it('sends DELETE with task id when delete button is clicked', async () => {
    const onDelete = vi.fn();

    server.use(
      http.delete('http://localhost:3000/tasks/:id', ({ params }) => {
        onDelete(params.id);
        return HttpResponse.json({ result: { id: params.id }, message: 'deleted', status: 200 });
      })
    );

    render(<TaskItem task={activeTask} />);

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('1'));
  });
});
