import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

import { ErrorFallback } from '@/components/common/error';
import { NotFound } from '@/components/common/not-found';
import { TanstackQueryDevTools } from '@/components/devtools/ts-query';
import { TanstackRouterDevTools } from '@/components/devtools/ts-router';

import { queryClient } from '@/lib/react-query';
import { router } from '@/lib/router';

type RouterContext = {
  queryClient: typeof queryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => <ErrorFallback error={error} />
});

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <TanstackQueryDevTools position="bottom" />
        <TanstackRouterDevTools position="bottom-left" router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
