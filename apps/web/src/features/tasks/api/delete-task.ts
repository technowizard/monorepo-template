import { useMutation } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';

import { apiClient } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { taskKeys } from './query-keys';

type DeleteTaskResponse = InferResponseType<(typeof apiClient.tasks)[':id']['$delete'], 200>;

export const deleteTask = async ({ id }: { id: string }): Promise<DeleteTaskResponse> => {
  const response = await apiClient.tasks[':id'].$delete({ param: { id } });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }

  return response.json();
};

type UseDeleteTaskOptions = {
  mutationConfig?: MutationConfig<typeof deleteTask>;
};

export const useDeleteTask = ({ mutationConfig }: UseDeleteTaskOptions = {}) =>
  useMutation({
    ...mutationConfig,
    mutationFn: deleteTask,
    meta: { invalidates: [taskKeys.all] }
  });
