import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/tests/test-utils';
import type { Task } from '@/types/api';

import { TaskList } from '../task-list';

// TaskItem is not under test here. mock it to avoid needing MSW for mutation hooks
vi.mock('../task-item', () => ({
  TaskItem: ({ task }: { task: Task }) => <div data-testid="task-item">{task.name}</div>
}));

const tasks: Task[] = [
  { id: '1', name: 'buy groceries', completed: false, createdAt: '', updatedAt: '' },
  { id: '2', name: 'fix bug', completed: true, createdAt: '', updatedAt: '' }
];

const baseProps = {
  isLoading: false,
  isError: false,
  filter: 'all' as const,
  refetch: vi.fn()
};

describe('TaskList', () => {
  it('shows 3 skeleton rows while loading', () => {
    const { container } = render(<TaskList {...baseProps} tasks={[]} isLoading />);

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThanOrEqual(3);
  });

  it('shows error message and retry button when fetch fails', () => {
    render(<TaskList {...baseProps} tasks={[]} isError />);

    expect(screen.getByText('failed to load tasks.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls refetch when retry is clicked', () => {
    const refetch = vi.fn();

    render(<TaskList {...baseProps} tasks={[]} isError refetch={refetch} />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows "no tasks yet." for empty all filter', () => {
    render(<TaskList {...baseProps} tasks={[]} filter="all" />);

    expect(screen.getByText('no tasks yet.')).toBeInTheDocument();
  });

  it('shows "no active tasks." for empty active filter', () => {
    render(<TaskList {...baseProps} tasks={[]} filter="active" />);

    expect(screen.getByText('no active tasks.')).toBeInTheDocument();
  });

  it('shows "nothing completed yet." for empty done filter', () => {
    render(<TaskList {...baseProps} tasks={[]} filter="done" />);

    expect(screen.getByText('nothing completed yet.')).toBeInTheDocument();
  });

  it('renders a TaskItem for each task', () => {
    render(<TaskList {...baseProps} tasks={tasks} />);

    expect(screen.getAllByTestId('task-item')).toHaveLength(2);
    expect(screen.getByText('buy groceries')).toBeInTheDocument();
    expect(screen.getByText('fix bug')).toBeInTheDocument();
  });
});
