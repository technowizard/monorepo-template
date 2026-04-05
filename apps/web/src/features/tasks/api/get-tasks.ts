import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseOptions, Task } from '@/types/api';

import { apiClient } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export const getTasks = async () => {
  const response = await apiClient.get('tasks');

  return response.json<ResponseOptions<Task[]>>();
};

export const getTasksQueryOptions = () => {
  return queryOptions({
    queryKey: ['tasks'],
    queryFn: () => getTasks()
  });
};

type UseTasksOptions = {
  queryConfig?: QueryConfig<typeof getTasksQueryOptions>;
};

export const useGetTasks = ({ queryConfig }: UseTasksOptions = {}) => {
  return useQuery({ ...getTasksQueryOptions(), ...queryConfig });
};
