import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

import { apiClient } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

import { taskKeys } from './query-keys';

type CreateTaskBody = InferRequestType<typeof apiClient.tasks.$post>['json'];
type CreateTaskResponse = InferResponseType<typeof apiClient.tasks.$post, 201>;

export const createTask = async (body: CreateTaskBody): Promise<CreateTaskResponse> => {
  const response = await apiClient.tasks.$post({ json: body });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
};

type UseCreateTaskOptions = {
  mutationConfig?: MutationConfig<typeof createTask>;
};

export const useCreateTask = ({ mutationConfig }: UseCreateTaskOptions = {}) =>
  useMutation({
    ...mutationConfig,
    mutationFn: createTask,
    meta: { invalidates: [taskKeys.all] }
  });
