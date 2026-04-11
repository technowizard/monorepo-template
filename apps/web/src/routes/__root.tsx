import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

import { ErrorFallback } from '@/components/common/error';
import { NotFound } from '@/components/common/not-found';
import { Notifications } from '@/components/common/notifications';
import { TanstackQueryDevTools } from '@/components/devtools/ts-query';
import { TanstackRouterDevTools } from '@/components/devtools/ts-router';

import type { queryClient } from '@/lib/react-query';

type RouterContext = {
  queryClient: typeof queryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => <ErrorFallback error={error} />
});

function RootComponent() {
  const { queryClient: client } = Route.useRouteContext();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={client}>
        <Outlet />
        <Notifications />
        <TanstackQueryDevTools position="bottom" />
        <TanstackRouterDevTools position="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
