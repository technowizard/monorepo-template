import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactNode } from 'react';

import { routeTree } from '@/routeTree.gen';

import { createQueryClient } from '@/lib/react-query';

function makeQueryClient() {
  const client = createQueryClient();

  client.setDefaultOptions({
    queries: { retry: false },
    mutations: { retry: false }
  });

  return client;
}

function Providers({ children }: { children: ReactNode }) {
  const queryClient = makeQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function customRender(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options });
}

/**
 * renders the full route tree via RouterProvider
 * use this for page-level tests that rely on routing hooks (Route.useSearch, useNavigate)
 * the router's context.queryClient is a fresh isolated instance per call
 */
export function renderPage(options: { initialPath?: string } = {}) {
  const queryClient = makeQueryClient();
  const history = createMemoryHistory({ initialEntries: [options.initialPath ?? '/'] });
  const router = createRouter({
    routeTree,
    history,
    context: { queryClient },
    defaultStructuralSharing: true
  });

  return render(<RouterProvider router={router} />);
}

export * from '@testing-library/react';
export { customRender as render };
