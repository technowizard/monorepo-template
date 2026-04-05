import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGetTasks } from '@/features/tasks/api/get-tasks';
import { CreateTaskForm } from '@/features/tasks/components/create-task-form';
import { TaskList } from '@/features/tasks/components/task-list';
import { useLanguage } from '@/hooks/use-language';
import { useThemeToggle } from '@/hooks/use-theme-toggle';
import { useTaskFilterStore } from '@/stores/task-filter';
import type { TaskFilter } from '@/stores/task-filter';

export function TasksPage() {
  const filter = useTaskFilterStore.useFilter();
  const setFilter = useTaskFilterStore.useSetFilter();

  const { toggle: toggleTheme } = useThemeToggle();
  const { next: nextLang, toggle: toggleLanguage } = useLanguage();
  const { t } = useTranslation('common');

  const { data, isLoading, isError, refetch } = useGetTasks();

  const tasks = data?.result ?? [];

  const filteredTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((t) => !t.completed);
    }

    if (filter === 'done') {
      return tasks.filter((t) => t.completed);
    }

    return tasks;
  }, [tasks, filter]);

  const activeCount = tasks.filter((t) => !t.completed).length;

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
          tasks={filteredTasks}
          isLoading={isLoading}
          isError={isError}
          filter={filter}
          refetch={refetch}
        />
      </div>
    </div>
  );
}
