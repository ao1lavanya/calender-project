import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { Task, Filters, Category } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { addDays, format, parseISO } from '../lib/date';

type Action =
  | { type: 'add', task: Task }
  | { type: 'update', id: string, patch: Partial<Task> }
  | { type: 'move', id: string, toStartISO: string } // keep duration
  | { type: 'resize', id: string, newStartISO?: string, newEndISO?: string }
  | { type: 'remove', id: string }
  ;

function tasksReducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case 'add':
      return [...state, action.task];
    case 'update':
      return state.map(t => t.id === action.id ? { ...t, ...action.patch } : t);
    case 'move': {
      const t = state.find(x => x.id === action.id);
      if (!t) return state;
      const days = Math.max(1, Math.round((parseISO(t.end).getTime() - parseISO(t.start).getTime()) / (24*3600*1000)) + 1);
      const newStart = parseISO(action.toStartISO);
      const newEnd = addDays(newStart, days - 1);
      return state.map(x => x.id === action.id ? { ...x, start: format(newStart, 'yyyy-MM-dd'), end: format(newEnd, 'yyyy-MM-dd') } : x);
    }
    case 'resize':
      return state.map(t => {
        if (t.id !== action.id) return t;
        return {
          ...t,
          start: action.newStartISO ?? t.start,
          end: action.newEndISO ?? t.end,
        };
      });
    case 'remove':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

type TaskCtx = {
  tasks: Task[];
  dispatch: React.Dispatch<Action>;
  filters: Filters;
  setFilters: (f: Filters) => void;
}

const Ctx = createContext<TaskCtx | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [persist, setPersist] = useLocalStorage<{ tasks: Task[], filters: Filters }>('planner.v1', {
    tasks: [],
    filters: { categories: ['To Do', 'In Progress', 'Review', 'Completed'], weeks: 0, query: '' }
  });
  const [tasks, dispatch] = useReducer(tasksReducer, persist.tasks);
  const value = useMemo<TaskCtx>(() => ({
    tasks,
    dispatch,
    filters: persist.filters,
    setFilters: (f) => setPersist({ tasks, filters: f })
  }), [tasks, persist.filters, setPersist]);
  React.useEffect(() => setPersist({ tasks, filters: persist.filters }), [tasks]); // persist changes
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTasks() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}

export function newTask(name: string, startISO: string, endISO: string, category: Category): Task {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    start: startISO,
    end: endISO,
    category,
  };
}