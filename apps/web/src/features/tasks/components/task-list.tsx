import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from '@/types/api';

import { TaskItem } from './task-item';

type Filter = 'all' | 'active' | 'done';

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  filter: Filter;
  refetch: () => void;
};

export function TaskList({ tasks, isLoading, isError, filter, refetch }: TaskListProps) {
  const { t } = useTranslation('common');

  if (isLoading) {
    return (
      <div>
        {(['w-3/4', 'w-1/2', 'w-2/3'] as const).map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 border-b border-border py-2 last:border-0"
          >
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className={`h-3 ${w}`} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 py-2 text-xs text-muted-foreground">
        <span>{t('tasks.error.load')}</span>
        <Button variant="ghost" size="xs" onClick={refetch}>
          {t('tasks.error.retry')}
        </Button>
      </div>
    );
  }

  if (tasks.length === 0) {
    const emptyKey = `tasks.empty.${filter}` as const;

    return <p className="py-2 text-xs text-muted-foreground">{t(emptyKey)}</p>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
