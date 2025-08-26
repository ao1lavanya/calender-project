import React from 'react';
import { Category } from '../types';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initialName?: string;
  initialCategory?: Category;
  onClose: () => void;
  onSubmit: (name: string, category: Category) => void;
};

const categories: Category[] = ['To Do', 'In Progress', 'Review', 'Completed'];

export default function TaskModal({ open, mode, initialName = '', initialCategory = 'To Do', onClose, onSubmit }: Props) {
  const [name, setName] = React.useState(initialName);
  const [category, setCategory] = React.useState<Category>(initialCategory);

  React.useEffect(() => {
    if (open) {
      setName(initialName);
      setCategory(initialCategory ?? 'To Do');
    }
  }, [open, initialName, initialCategory]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{mode === 'create' ? 'Create Task' : 'Edit Task'}</h3>
        <label>
          Task name
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Write report" />
        </label>
        <label>
          Category
          <select value={category} onChange={e => setCategory(e.target.value as Category)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className="actions">
          <button onClick={onClose} className="btn secondary">Cancel</button>
          <button onClick={() => onSubmit(name.trim() || 'Untitled Task', category)} className="btn primary">
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}