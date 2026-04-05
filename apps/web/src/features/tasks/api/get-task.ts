import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseOptions, Task } from '@/types/api';

import { apiClient } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export const getTask = async (id: string): Promise<ResponseOptions<Task>> => {
  const response = await apiClient.get(`tasks/${id}`);

  return response.json<ResponseOptions<Task>>();
};

export const getTaskQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['task', id],
    queryFn: () => getTask(id)
  });
};

type UseTaskOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getTaskQueryOptions>;
};

export const useGetTask = ({ id, queryConfig }: UseTaskOptions) => {
  return useQuery({ ...getTaskQueryOptions(id), ...queryConfig });
};
