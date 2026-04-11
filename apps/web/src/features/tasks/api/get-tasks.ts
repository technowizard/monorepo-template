import { queryOptions, useQuery } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';

import { apiClient } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

import { taskKeys } from './query-keys';

type TasksResponse = InferResponseType<typeof apiClient.tasks.$get, 200>;

export type Task = TasksResponse['result'][number];
export type TaskFilter = 'all' | 'active' | 'done';

export const getTasks = async (): Promise<TasksResponse> => {
  const response = await apiClient.tasks.$get();

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};

export const filterTasks = (tasks: Task[], filter: TaskFilter): Task[] => {
  if (filter === 'active') {
    return tasks.filter((t) => !t.completed);
  }

  if (filter === 'done') {
    return tasks.filter((t) => t.completed);
  }

  return tasks;
};

export const getTasksQueryOptions = (filter: TaskFilter = 'all') =>
  queryOptions({
    queryKey: taskKeys.list({ filter }),
    queryFn: getTasks,
    select: (data) => ({ ...data, result: filterTasks(data.result ?? [], filter) })
  });

type UseTasksOptions = {
  filter?: TaskFilter;
  queryConfig?: QueryConfig<typeof getTasksQueryOptions>;
};

export const useGetTasks = ({ filter = 'all', queryConfig }: UseTasksOptions = {}) =>
  useQuery({ ...getTasksQueryOptions(filter), ...queryConfig });
