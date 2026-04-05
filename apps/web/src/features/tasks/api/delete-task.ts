import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { getTasksQueryOptions } from './get-tasks';

export const deleteTask = async ({ id }: { id: string }) => {
  const response = await apiClient.delete(`tasks/${id}`);

  return response.json();
};

type UseDeleteTaskOptions = {
  mutationConfig?: MutationConfig<typeof deleteTask>;
};

export const useDeleteTask = ({ mutationConfig }: UseDeleteTaskOptions = {}) => {
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
    mutationFn: deleteTask
  });
};
