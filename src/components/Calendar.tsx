import React from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTasks, newTask } from '../state/TaskContext';
import { Task, Category } from '../types';
import FiltersPanel from './FiltersPanel';
import TaskModal from './TaskModal';
import {
  monthMatrix, toISO, isSameMonth, parseISO, format, addDays, startOfMonth, endOfMonth, differenceInCalendarDays, intersectsRange
} from '../lib/date';

const DAY_WIDTH = 140;

type ResizeState = { task: Task, edge: 'left'|'right' } | null;

export default function Calendar() {
  const today = React.useMemo(() => new Date(), []);
  const current = React.useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const { weeks } = monthMatrix(current);
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);

  const { tasks, dispatch, filters, setFilters } = useTasks();

  // Selection state
  const [dragging, setDragging] = React.useState<{ startISO: string, endISO: string } | null>(null);
  const [modal, setModal] = React.useState<{ open: boolean, mode: 'create'|'edit', startISO?: string, endISO?: string, task?: Task }>({
    open: false, mode: 'create'
  });

  // Resize state
  const [resizing, setResizing] = React.useState<ResizeState>(null);

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Mouse selection across tiles
  function onMouseDown(e: React.MouseEvent) {
    const iso = (e.target as HTMLElement).closest('.day')?.getAttribute('data-iso');
    if (!iso) return;
    setDragging({ startISO: iso, endISO: iso });
    window.addEventListener('mousemove', onMouseMove as any);
    window.addEventListener('mouseup', onMouseUp as any, { once: true });
  }
  function onMouseMove(e: MouseEvent) {
    const iso = (e.target as HTMLElement)?.closest('.day')?.getAttribute('data-iso');
    if (!iso) return;
    setDragging(prev => prev ? { ...prev, endISO: iso } : null);
  }
  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove as any);
    if (!dragging) return;
    // normalize range within current month
    const start = parseISO(dragging.startISO);
    const end = parseISO(dragging.endISO);
    const s = start < end ? start : end;
    const e = start < end ? end : start;
    const sISO = toISO(s), eISO = toISO(e);
    setDragging(null);
    setModal({ open: true, mode: 'create', startISO: sISO, endISO: eISO });
  }

  // Drag end for moving tasks
  function onDragEnd(e: DragEndEvent) {
    const id = e.active?.id as string;
    const overISO = (e.over?.rect?.current?.translated || e.over?.rect?.current)
      ? (document.elementFromPoint(e.delta.x + (e.activatorEvent as any).clientX, e.delta.y + (e.activatorEvent as any).clientY)?.closest('.day')?.getAttribute('data-iso'))
      : (e.over && (e.over as any).data?.current?.iso);
    // Fallback: use the element under pointer
    const iso = (e.over && (e.over as any).id && typeof (e.over as any).id === 'string') ? (e.over as any).id : overISO
      || (document.elementFromPoint((e.activatorEvent as any).clientX + e.delta.x, (e.activatorEvent as any).clientY + e.delta.y)?.closest('.day')?.getAttribute('data-iso'));

    if (id && iso) {
      dispatch({ type: 'move', id, toStartISO: iso });
    }
  }

  // Resize logic
  function onResizeStart(task: Task, edge: 'left' | 'right') {
    setResizing({ task, edge });
    function move(ev: MouseEvent) {
      const iso = (ev.target as HTMLElement)?.closest('.day')?.getAttribute('data-iso');
      if (!iso) return;
      if (edge === 'left') {
        const newStart = parseISO(iso) <= parseISO(task.end) ? iso : task.end;
        dispatch({ type: 'resize', id: task.id, newStartISO: newStart });
      } else {
        const newEnd = parseISO(iso) >= parseISO(task.start) ? iso : task.start;
        dispatch({ type: 'resize', id: task.id, newEndISO: newEnd });
      }
    }
    function up() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      setResizing(null);
      // After resizing, open modal to confirm category (per spec "On task ... editing: a modal must appear")
      const t = tasks.find(x => x.id === task.id);
      if (t) setModal({ open: true, mode: 'edit', task: t });
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up, { once: true });
  }

  // Compute tasks per day (first day they appear)
  function tasksStartingOn(iso: string) {
    return tasks
      .filter(t => t.start === iso)
      .filter(t => {
        if (filters.query && !t.name.toLowerCase().includes(filters.query.toLowerCase())) return false;
        if (filters.categories.length && !filters.categories.includes(t.category)) return false;
        if (filters.weeks > 0) {
          const windowStart = new Date();
          const windowEnd = addDays(windowStart, filters.weeks * 7);
          if (!intersectsRange(t.start, t.end, windowStart, windowEnd)) return false;
        }
        return true;
      });
  }

  return (
    <div className="layout">
      <aside>
        <FiltersPanel filters={filters} onChange={setFilters} />
        <div className="hint">
          <strong>Tips</strong>
          <ul>
            <li>Drag across days to create a task.</li>
            <li>Drag a task to move it.</li>
            <li>Drag the task edges to resize.</li>
            <li>Double-click a task to edit name/category.</li>
          </ul>
        </div>
      </aside>

      <main>
        <header className="header">
          <h1>Month View Task Planner</h1>
          <div className="month-label">{format(current, 'MMMM yyyy')}</div>
        </header>

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="calendar" onMouseDown={onMouseDown}>
            <div className="dow">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="dow-cell">{d}</div>)}
            </div>
            {weeks.map((week, i) => (
              <div className="week" key={i}>
                {week.map(d => (
                  <DaySlot
                    key={toISO(d)}
                    date={d}
                    inMonth={isSameMonth(d, current)}
                    today={today}
                    tasksStarting={tasksStartingOn(toISO(d))}
                    dayWidth={DAY_WIDTH}
                    onResizeStart={onResizeStart}
                    onEdit={(t) => setModal({ open: true, mode: 'edit', task: t })}
                  />
                ))}
              </div>
            ))}
            {dragging && <SelectionOverlay startISO={dragging.startISO} endISO={dragging.endISO} />}
          </div>
        </DndContext>
      </main>

      <TaskModal
        open={modal.open}
        mode={modal.mode}
        initialName={modal.task?.name}
        initialCategory={modal.task?.category}
        onClose={() => setModal({ open: false, mode: 'create' })}
        onSubmit={(name, category) => {
          if (modal.mode === 'create') {
            const t = newTask(name, modal.startISO!, modal.endISO!, category);
            dispatch({ type: 'add', task: t });
          } else if (modal.task) {
            dispatch({ type: 'update', id: modal.task.id, patch: { name, category } });
          }
          setModal({ open: false, mode: 'create' });
        }}
      />
    </div>
  );
}

function DaySlot({
  date, inMonth, today, tasksStarting, dayWidth, onResizeStart, onEdit
}: {
  date: Date;
  inMonth: boolean;
  today: Date;
  tasksStarting: Task[];
  dayWidth: number;
  onResizeStart: (task: Task, edge: 'left'|'right') => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className={"day"+(inMonth?'':' dim')+(date.toDateString()===today.toDateString()?' today':'')} data-iso={toISO(date)}>
      <div className="day-head">
        <span className="day-num">{date.getDate()}</span>
      </div>
      <div className="day-body">
        {tasksStarting.map(t => (
          <TaskRow key={t.id} task={t} dayWidth={dayWidth} onResizeStart={onResizeStart} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, dayWidth, onResizeStart, onEdit }: {
  task: Task;
  dayWidth: number;
  onResizeStart: (task: Task, edge: 'left'|'right') => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className="taskrow" data-task-id={task.id}>
      {/* The TaskBar itself is positioned within the starting day; spans width across duration */}
      <span className="row-start" />
      <div className="row-bar">
        <TaskBar task={task} dayWidth={dayWidth} onResizeStart={onResizeStart} onEdit={onEdit} />
      </div>
    </div>
  );
}

function SelectionOverlay({ startISO, endISO }: { startISO: string; endISO: string }) {
  // purely visual: highlight will be handled by CSS via [data-iso] match? We'll render a guideline bar.
  return <div className="selection-hint" />;
}