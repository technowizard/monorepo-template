import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { getTasksQueryOptions } from './get-tasks';

export const createTaskBodySchema = z.object({
  name: z.string(),
  completed: z.boolean().optional()
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;

export const createTask = async (input: CreateTaskBody) => {
  const response = await apiClient.post('tasks', input);

  return response.json();
};

type UseCreateTaskOptions = {
  mutationConfig?: MutationConfig<typeof createTask>;
};

export const useCreateTask = ({ mutationConfig }: UseCreateTaskOptions = {}) => {
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
    mutationFn: createTask
  });
};
