import { PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateTask } from '@/features/tasks/api/create-task';
import { useNotificationsStore } from '@/stores/notifications';

export function CreateTaskForm() {
  const [value, setValue] = useState('');
  const add = useNotificationsStore.useAdd();
  const { t } = useTranslation('common');

  const createTaskMutation = useCreateTask({
    mutationConfig: {
      onError: () => add({ message: t('tasks.error.create'), type: 'error' })
    }
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    createTaskMutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => setValue('')
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <span className="shrink-0 select-none text-xs text-muted-foreground">&gt;</span>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('tasks.addPlaceholder')}
        disabled={createTaskMutation.isPending}
        className="flex-1"
        autoFocus
      />
      <Button
        type="submit"
        size="icon-sm"
        variant="outline"
        disabled={!value.trim() || createTaskMutation.isPending}
        aria-label={t('tasks.aria.addTask')}
      >
        <PlusIcon />
      </Button>
    </form>
  );
}
