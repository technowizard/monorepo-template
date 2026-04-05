import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server } from '@/tests/mocks/server';
import { render, screen, waitFor } from '@/tests/test-utils';

import { CreateTaskForm } from '../create-task-form';

describe('CreateTaskForm', () => {
  it('renders the input and submit button', () => {
    render(<CreateTaskForm />);

    expect(screen.getByPlaceholderText('add a task...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    render(<CreateTaskForm />);

    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled();
  });

  it('submit button is disabled for whitespace-only input', async () => {
    render(<CreateTaskForm />);

    await userEvent.type(screen.getByPlaceholderText('add a task...'), '   ');

    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled();
  });

  it('sends POST with trimmed name on submit', async () => {
    const onPost = vi.fn();

    server.use(
      http.post('http://localhost:3000/tasks', async ({ request }) => {
        onPost(await request.json());

        return HttpResponse.json(
          {
            result: {
              id: '99',
              name: 'buy groceries',
              completed: false,
              createdAt: '',
              updatedAt: ''
            },
            message: 'created',
            status: 201
          },
          { status: 201 }
        );
      })
    );

    render(<CreateTaskForm />);

    await userEvent.type(screen.getByPlaceholderText('add a task...'), '  buy groceries  ');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => expect(onPost).toHaveBeenCalledWith({ name: 'buy groceries' }));
  });

  it('clears input after successful submission', async () => {
    render(<CreateTaskForm />);

    await userEvent.type(screen.getByPlaceholderText('add a task...'), 'buy groceries');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => expect(screen.getByPlaceholderText('add a task...')).toHaveValue(''));
  });

  it('disables input and button while POST is in flight', async () => {
    server.use(
      http.post('http://localhost:3000/tasks', async () => {
        await new Promise((r) => setTimeout(r, 200));

        return HttpResponse.json(
          {
            result: { id: '99', name: 'test', completed: false, createdAt: '', updatedAt: '' },
            message: 'created',
            status: 201
          },
          { status: 201 }
        );
      })
    );

    render(<CreateTaskForm />);

    await userEvent.type(screen.getByPlaceholderText('add a task...'), 'test');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByPlaceholderText('add a task...')).toBeDisabled();
  });
});
