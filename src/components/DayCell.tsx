import React from 'react';
import { Task } from '../types';
import TaskBar from './TaskBar';
import { format, isSameMonth, isSameDay, toISO, daySpanInclusive } from '../lib/date';

type Props = {
  date: Date;
  inMonth: boolean;
  today: Date;
  tasks: Task[];
  dayWidth: number;
  onResizeStart: (task: Task, edge: 'left' | 'right') => void;
  onEdit: (task: Task) => void;
};

export default function DayCell({ date, inMonth, today, tasks, dayWidth, onResizeStart, onEdit }: Props) {
  return (
    <div
      className={"day" + (inMonth ? "" : " dim") + (isSameDay(date, today) ? " today" : "")}
      data-iso={toISO(date)}
    >
      <div className="day-head">
        <span className="day-num">{format(date, 'd')}</span>
      </div>
      <div className="day-body">
        {tasks.map(t => (
          <TaskBar key={t.id} task={t} dayWidth={dayWidth} onResizeStart={onResizeStart} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}