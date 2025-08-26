import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, differenceInCalendarDays, addWeeks, parseISO, isBefore, isAfter
} from 'date-fns'

export function monthMatrix(current: Date) {
  const startMonth = startOfMonth(current);
  const endMonth_ = endOfMonth(current);
  const start = startOfWeek(startMonth, { weekStartsOn: 0 });
  const end = endOfWeek(endMonth_, { weekStartsOn: 0 });
  const days: Date[] = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return { weeks, startMonth, endMonth: endMonth_ };
}

export function toISO(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export function clampToMonth(date: Date, monthDate: Date) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  if (isBefore(date, start)) return start;
  if (isAfter(date, end)) return end;
  return date;
}

export function daySpanInclusive(startISO: string, endISO: string) {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  return differenceInCalendarDays(e, s) + 1;
}

export function intersectsRange(taskStartISO: string, taskEndISO: string, windowStart: Date, windowEnd: Date) {
  const ts = parseISO(taskStartISO);
  const te = parseISO(taskEndISO);
  const start = windowStart <= te;
  const end = windowEnd >= ts;
  return start && end;
}

export function isSameISO(aISO: string, bISO: string) {
  return format(parseISO(aISO), 'yyyy-MM-dd') === format(parseISO(bISO), 'yyyy-MM-dd');
}

export { format, isSameMonth, isSameDay, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInCalendarDays, addWeeks, parseISO };