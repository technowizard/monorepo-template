import { XIcon } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDeleteTask } from '@/features/tasks/api/delete-task';
import type { Task } from '@/features/tasks/api/get-tasks';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useNotificationsStore } from '@/stores/notifications';

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation('common');
  const add = useNotificationsStore.useAdd();

  const updateTaskMutation = useUpdateTask({
    mutationConfig: {
      onError: () => add({ message: t('tasks.error.update'), type: 'error' })
    }
  });
  const deleteTaskMutation = useDeleteTask({
    mutationConfig: { onError: () => add({ message: t('tasks.error.delete'), type: 'error' }) }
  });

  function startEditing() {
    setEditValue(task.name);

    setIsEditing(true);

    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function saveEdit() {
    const trimmed = editValue.trim();

    if (trimmed && trimmed !== task.name) {
      updateTaskMutation.mutate({ id: task.id, body: { name: trimmed } });
    }

    setIsEditing(false);
  }

  function cancelEdit() {
    setEditValue(task.name);

    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      saveEdit();
    }

    if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  function toggleComplete() {
    updateTaskMutation.mutate({ id: task.id, body: { completed: !task.completed } });
  }

  return (
    <div className="group flex items-center gap-2.5 border-b border-border py-2 last:border-0">
      <Checkbox
        checked={task.completed}
        onCheckedChange={toggleComplete}
        disabled={updateTaskMutation.isPending}
        aria-label={t(task.completed ? 'tasks.aria.markIncomplete' : 'tasks.aria.markComplete', {
          name: task.name
        })}
      />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-xs text-foreground outline-none"
          />
        ) : (
          <span
            onClick={startEditing}
            className={`block cursor-text truncate text-xs transition-opacity ${
              task.completed ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'
            }`}
          >
            {task.name}
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => deleteTaskMutation.mutate({ id: task.id })}
        onMouseDown={(e) => e.preventDefault()}
        disabled={deleteTaskMutation.isPending}
        aria-label={t('tasks.aria.deleteTask', { name: task.name })}
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <XIcon />
      </Button>
    </div>
  );
}
