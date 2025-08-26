import React from 'react';
import { Category, Filters } from '../types';

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
};

const cats: Category[] = ['To Do', 'In Progress', 'Review', 'Completed'];

export default function FiltersPanel({ filters, onChange }: Props) {

  function toggleCategory(c: Category) {
    const set = new Set(filters.categories);
    if (set.has(c)) set.delete(c); else set.add(c);
    onChange({ ...filters, categories: Array.from(set) as Category[] });
  }

  return (
    <div className="panel">
      <input
        className="search"
        placeholder="Search by task name..."
        value={filters.query}
        onChange={e => onChange({ ...filters, query: e.target.value })}
      />
      <div className="section">
        <div className="title">Category Filters</div>
        <div className="row">
          {cats.map(c => (
            <label key={c} className="chip">
              <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => toggleCategory(c)} />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="section">
        <div className="title">Time-Based</div>
        <div className="row">
          {[0,1,2,3].map(w => (
            <label key={w} className="chip">
              <input
                type="radio"
                name="weeks"
                checked={filters.weeks === (w as 0|1|2|3)}
                onChange={() => onChange({ ...filters, weeks: w as 0|1|2|3 })}
              />
              <span>{w === 0 ? 'All time' : `Within ${w} week${w>1?'s':''}`}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}