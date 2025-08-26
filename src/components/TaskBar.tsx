import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../types';
import { daySpanInclusive } from '../lib/date';

type Props = {
  task: Task;
  dayWidth: number;
  onResizeStart: (task: Task, edge: 'left' | 'right') => void;
  onEdit: (task: Task) => void;
};

const COLORS: Record<string, string> = {
  'To Do': '#8b5cf6',
  'In Progress': '#10b981',
  'Review': '#f59e0b',
  'Completed': '#3b82f6',
};

export default function TaskBar({ task, dayWidth, onResizeStart, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const days = daySpanInclusive(task.start, task.end);
  const color = COLORS[task.category] ?? '#64748b';

  return (
    <div
      ref={setNodeRef}
      className="taskbar"
      style={{
        width: days * dayWidth - 6,
        opacity: isDragging ? 0.6 : 1,
        background: color
      }}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onEdit(task)}
      title={`${task.name} • ${task.category}`}
    >
      <span className="handle left" onMouseDown={(e) => { e.stopPropagation(); onResizeStart(task, 'left'); }} />
      <div className="label">{task.name}</div>
      <span className="handle right" onMouseDown={(e) => { e.stopPropagation(); onResizeStart(task, 'right'); }} />
    </div>
  );
}