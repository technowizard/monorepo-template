import { produce } from 'immer';
import { create } from 'zustand';

import { createSelectorHooks } from '@/lib/create-selector-hooks';

export type TaskFilter = 'all' | 'active' | 'done';

type TaskFilterState = {
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
};

export const useTaskFilterStore = createSelectorHooks(
  create<TaskFilterState>()((set) => ({
    filter: 'all',
    setFilter: (filter) =>
      set(
        produce((state) => {
          state.filter = filter;
        })
      )
  }))
);
