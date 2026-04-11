import { queryOptions, useQuery } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';

import { apiClient } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

import { taskKeys } from './query-keys';

type TaskResponse = InferResponseType<(typeof apiClient.tasks)[':id']['$get'], 200>;

export const getTask = async (id: string): Promise<TaskResponse> => {
  const response = await apiClient.tasks[':id'].$get({ param: { id } });

  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }

  return response.json();
};

export const getTaskQueryOptions = (id: string) =>
  queryOptions({ queryKey: taskKeys.detail(id), queryFn: () => getTask(id) });

type UseTaskOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getTaskQueryOptions>;
};

export const useGetTask = ({ id, queryConfig }: UseTaskOptions) =>
  useQuery({ ...getTaskQueryOptions(id), ...queryConfig });
