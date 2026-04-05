import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ResponseOptions, Task } from '@/types/api';

import { apiClient } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { getTasksQueryOptions } from './get-tasks';

export const updateTask = async ({
  id,
  body
}: {
  id: string;
  body: Partial<Task>;
}): Promise<ResponseOptions<Task>> => {
  const response = await apiClient.patch(`tasks/${id}`, body);

  return response.json<ResponseOptions<Task>>();
};

type UseUpdateTaskOptions = {
  mutationConfig?: MutationConfig<typeof updateTask>;
};

export const useUpdateTask = ({ mutationConfig }: UseUpdateTaskOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryOptions().queryKey
      });

      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateTask
  });
};
