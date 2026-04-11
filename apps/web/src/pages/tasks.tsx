import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGetTasks } from '@/features/tasks/api/get-tasks';
import type { TaskFilter } from '@/features/tasks/api/get-tasks';
import { CreateTaskForm } from '@/features/tasks/components/create-task-form';
import { TaskList } from '@/features/tasks/components/task-list';
import { useLanguage } from '@/hooks/use-language';
import { useThemeToggle } from '@/hooks/use-theme-toggle';

import { Route } from '@/routes/index';

export function TasksPage() {
  const { filter } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { toggle: toggleTheme } = useThemeToggle();
  const { next: nextLang, toggle: toggleLanguage } = useLanguage();
  const { t } = useTranslation('common');

  const { data, isLoading, isError, refetch } = useGetTasks({ filter });

  // always read the unfiltered list for the "N remaining" badge
  const { data: allData } = useGetTasks({ filter: 'all' });
  const activeCount = (allData?.result ?? []).filter((t) => !t.completed).length;

  const tasks = data?.result ?? [];

  const setFilter = (value: TaskFilter) =>
    navigate({ search: (prev) => ({ ...prev, filter: value }) });

  const filters: { label: string; value: TaskFilter }[] = [
    { label: t('tasks.filters.all'), value: 'all' },
    { label: t('tasks.filters.active'), value: 'active' },
    { label: t('tasks.filters.done'), value: 'done' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-sm font-bold uppercase tracking-widest text-foreground">
              {t('tasks.heading')}
            </h1>
            <span className="text-xs text-muted-foreground">
              {t('tasks.remaining', { count: activeCount })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleLanguage}
              aria-label={t('tasks.aria.switchLanguage')}
              className="font-mono text-xs text-muted-foreground"
            >
              {nextLang.toUpperCase()}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={t('tasks.aria.toggleTheme')}
            >
              <SunIcon className="dark:hidden" />
              <MoonIcon className="hidden dark:block" />
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />

        <CreateTaskForm />

        <Separator className="my-4" />

        <div className="mb-3 flex items-center gap-0">
          {filters.map((f, i) => (
            <span key={f.value} className="flex items-center">
              <button
                type="button"
                onClick={() => setFilter(f.value)}
                className={`text-xs transition-colors ${
                  filter === f.value
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
              {i < filters.length - 1 && (
                <span className="mx-1.5 text-xs text-muted-foreground/40">·</span>
              )}
            </span>
          ))}
        </div>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          isError={isError}
          filter={filter}
          refetch={refetch}
        />
      </div>
    </div>
  );
}
