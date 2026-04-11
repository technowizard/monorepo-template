import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Toaster } from '@/components/ui/sonner';
import { useNotificationsStore } from '@/stores/notifications';

// syncs the notifications store into sonner toasts
// each new store entry fires a toast; dismissing (manually or via auto-close)
// removes the entry from the store, keeping the two in sync
function useNotificationBridge() {
  const notifications = useNotificationsStore.useNotifications();
  const remove = useNotificationsStore.useRemove();
  const shownIds = useRef(new Set<string>());

  useEffect(() => {
    for (const n of notifications) {
      if (shownIds.current.has(n.id)) {
        continue;
      }

      shownIds.current.add(n.id);

      const dismiss = () => {
        remove(n.id);

        shownIds.current.delete(n.id);
      };

      const toastFn =
        n.type === 'error' ? toast.error : n.type === 'success' ? toast.success : toast.info;

      toastFn(n.message, { id: n.id, onDismiss: dismiss, onAutoClose: dismiss });
    }
  }, [notifications, remove]);
}

export function Notifications() {
  useNotificationBridge();

  return <Toaster />;
}
