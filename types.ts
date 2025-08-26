export type Category = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface Task {
  id: string;
  name: string;
  start: string; // ISO date (yyyy-MM-dd) inclusive
  end: string;   // ISO date (yyyy-MM-dd) inclusive
  category: Category;
}

export interface Filters {
  categories: Category[]; // multi-select
  weeks: 0 | 1 | 2 | 3;   // 0 means 'all time'
  query: string;          // live search
}