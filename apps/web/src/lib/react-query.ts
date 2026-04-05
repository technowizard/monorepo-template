import { QueryClient, type DefaultOptions, type UseMutationOptions } from '@tanstack/react-query';

const queryConfig = {
  mutations: {
    retry: 1,
    retryDelay: 1000
  },
  queries: {
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: (failureCount) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    staleTime: 5 * 60 * 1000
  }
} satisfies DefaultOptions;

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type ApiFnReturnType<FnType extends (...args: unknown[]) => Promise<unknown>> = Awaited<
  ReturnType<FnType>
>;

export type QueryConfig<TQueryOptionsFn extends (...args: any[]) => any> = Partial<
  Omit<ReturnType<TQueryOptionsFn>, 'queryKey' | 'queryFn'>
>;

export type MutationConfig<MutationFnType extends (...args: any[]) => any> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
