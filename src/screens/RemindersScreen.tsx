import React, { useState, useMemo } from 'react';
import { Plus, Check, Trash2, Calendar, AlertCircle, Clock, X } from 'lucide-react';
import type { ReminderItem, PriorityLevel } from '../types';
import { Storage } from '../lib/storage';

interface RemindersScreenProps {
  reminders: ReminderItem[];
  onRefresh: () => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  reminders,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setDueDate(tomorrow.toISOString().slice(0, 16));
    setPriority('medium');
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: ReminderItem) => {
    setTitle(r.title);
    setDescription(r.description || '');
    setDueDate(r.dueDate ? r.dueDate.slice(0, 16) : '');
    setPriority(r.priority);
    setEditingReminder(r);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const reminder: ReminderItem = {
      id: editingReminder ? editingReminder.id : `rem_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || new Date().toISOString(),
      priority,
      completed: editingReminder ? editingReminder.completed : false,
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString(),
    };

    Storage.saveReminder(reminder);
    onRefresh();
    setIsModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    Storage.deleteReminder(id);
    onRefresh();
  };

  const handleToggleComplete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    Storage.toggleReminderComplete(id);
    onRefresh();
  };

  // Check if a reminder is overdue
  const isOverdue = (r: ReminderItem) => {
    if (r.completed || !r.dueDate) return false;
    return new Date(r.dueDate).getTime() < Date.now();
  };

  // Stats calculation
  const total = reminders.length;
  const pending = reminders.filter((r) => !r.completed).length;
  const done = reminders.filter((r) => r.completed).length;
  const overdueCount = reminders.filter(isOverdue).length;

  // Sorted list: Overdue first, then pending by date, then completed at bottom
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [reminders]);

  const getPriorityColor = (p: PriorityLevel) => {
    switch (p) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'low': return 'text-teal-600 bg-teal-500/10 border-teal-500/30';
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-heading font-semibold text-[var(--color-on-surface)]">
            Reminders & Tasks
          </h2>
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            Peace of mind for your daily intentions
          </p>
        </div>
      </div>

      {/* Stats Header Bar */}
      <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-center shadow-xs">
        <div>
          <div className="text-base font-bold text-[var(--color-on-surface)]">{total}</div>
          <div className="text-[10px] text-[var(--color-on-surface-variant)]">Total</div>
        </div>
        <div>
          <div className="text-base font-bold text-amber-500">{pending}</div>
          <div className="text-[10px] text-[var(--color-on-surface-variant)]">Pending</div>
        </div>
        <div>
          <div className="text-base font-bold text-teal-600">{done}</div>
          <div className="text-[10px] text-[var(--color-on-surface-variant)]">Done</div>
        </div>
        <div>
          <div className={`text-base font-bold ${overdueCount > 0 ? 'text-rose-500' : 'text-[var(--color-on-surface)]'}`}>
            {overdueCount}
          </div>
          <div className="text-[10px] text-[var(--color-on-surface-variant)]">Overdue</div>
        </div>
      </div>

      {/* Reminders List */}
      {sortedReminders.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/10 text-[var(--color-primary)] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
            No active reminders
          </h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
            Your schedule is completely clear. Add a mindful reminder whenever you're ready.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedReminders.map((r) => {
            const overdue = isOverdue(r);
            const dateObj = new Date(r.dueDate);
            const dateFormatted = dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={r.id}
                onClick={() => openEditModal(r)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  r.completed
                    ? 'bg-[var(--color-surface)]/60 border-[var(--color-surface-border)]/50 opacity-60'
                    : overdue
                    ? 'bg-rose-500/5 border-rose-500/40 hover:bg-rose-500/10'
                    : 'bg-[var(--color-surface)] border-[var(--color-surface-border)] hover:border-teal-500/40 shadow-xs'
                }`}
              >
                {/* Complete checkbox */}
                <button
                  onClick={(e) => handleToggleComplete(e, r.id)}
                  className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    r.completed
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-[var(--color-surface-border)] hover:border-teal-500 text-transparent'
                  }`}
                  aria-label="Toggle Complete"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-semibold text-[var(--color-on-surface)] truncate ${
                        r.completed ? 'line-through text-[var(--color-on-surface-variant)]' : ''
                      }`}
                    >
                      {r.title}
                    </h4>
                    {overdue && (
                      <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> Overdue
                      </span>
                    )}
                  </div>

                  {r.description && (
                    <p className="text-[11px] text-[var(--color-on-surface-variant)] line-clamp-1 mt-0.5">
                      {r.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[var(--color-on-surface-variant)]">
                    <span className={`px-1.5 py-0.5 rounded border uppercase text-[8px] font-bold ${getPriorityColor(r.priority)}`}>
                      {r.priority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[var(--color-gold)]" />
                      {dateFormatted}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, r.id)}
                  className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-rose-500 transition-colors"
                  aria-label="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB (Icon only, 56px circle) */}
      <button
        onClick={openAddModal}
        aria-label="Add Reminder"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 z-30"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-surface-border)]">
              <h3 className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
                {editingReminder ? 'Edit Reminder' : 'New Reminder'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="What would you like to remember?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                  Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="low">Low (Teal)</option>
                    <option value="medium">Medium (Gold)</option>
                    <option value="high">High (Red)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-semibold shadow-sm transition-all active:scale-98"
                >
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
