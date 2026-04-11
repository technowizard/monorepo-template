import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

import { apiClient } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { taskKeys } from './query-keys';

type UpdateTaskBody = InferRequestType<(typeof apiClient.tasks)[':id']['$patch']>['json'];
type UpdateTaskResponse = InferResponseType<(typeof apiClient.tasks)[':id']['$patch'], 200>;

export const updateTask = async ({
  id,
  body
}: {
  id: string;
  body: UpdateTaskBody;
}): Promise<UpdateTaskResponse> => {
  const response = await apiClient.tasks[':id'].$patch({ param: { id }, json: body });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return response.json();
};

type UseUpdateTaskOptions = {
  mutationConfig?: MutationConfig<typeof updateTask>;
};

export const useUpdateTask = ({ mutationConfig }: UseUpdateTaskOptions) =>
  useMutation({
    ...mutationConfig,
    mutationFn: updateTask,
    meta: { invalidates: [taskKeys.all] }
  });
