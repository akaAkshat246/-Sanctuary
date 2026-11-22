import React, { useState, useMemo } from 'react';
import {
  PlusIcon as Plus,
  CheckIcon as Check,
  TrashIcon as Trash2,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  CloseIcon as X,
  BellIcon as Bell,
} from '../components/icons';
import type { ReminderItem } from '../types';
import { Storage } from '../lib/storage';
import { hapticLight, hapticMedium, hapticSuccess, hapticSelection } from '../lib/haptics';

interface RemindersScreenProps {
  reminders: ReminderItem[];
  onRefresh: () => void;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({ reminders, onRefresh, showToast }) => {
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('09:00');

  const prevMonth = () => {
    hapticSelection();
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    hapticSelection();
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute calendar grid
  const calendarGrid = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNumber: number; dateString: string; isCurrentMonth: boolean }> = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: 0, dateString: '', isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      days.push({ dayNumber: d, dateString: `${year}-${monthStr}-${dayStr}`, isCurrentMonth: true });
    }
    return days;
  }, [calendarDate]);

  const datesWithReminders = useMemo(() => {
    const set = new Set<string>();
    reminders.forEach((r) => {
      if (r.date) set.add(r.date);
    });
    return set;
  }, [reminders]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    hapticMedium();
    const newReminder: ReminderItem = {
      id: `rem_${Date.now()}`,
      title: reminderTitle.trim(),
      date: reminderDate || new Date().toISOString().split('T')[0],
      time: reminderTime || '09:00',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await Storage.saveReminder(newReminder);
    setIsModalOpen(false);
    setReminderTitle('');
    onRefresh();
    hapticSuccess();
    showToast?.('Reminder created');
  };

  const handleToggle = async (id: string) => {
    hapticLight();
    await Storage.toggleReminderComplete(id);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    hapticMedium();
    await Storage.deleteReminder(id);
    onRefresh();
    showToast?.('Reminder removed', 'info');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const displayedReminders = useMemo(() => {
    if (selectedDay) {
      return reminders.filter((r) => r.date === selectedDay);
    }
    return reminders;
  }, [reminders, selectedDay]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Top Header Row matching Image 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
            Reminders
          </h1>
          <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] italic">
            Gentle nudges for your mindful journey.
          </p>
        </div>

        <button
          onClick={() => {
            setReminderTitle('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#082a20] hover:bg-[#0c382b] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add New</span>
        </button>
      </div>

      {/* Large Calendar Card matching Image 5 */}
      <div className="rounded-[28px] p-6 sm:p-8 bg-white dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-[#12332a] dark:text-white tracking-wide">
            {monthName}
          </h3>
          <div className="flex items-center gap-1 text-[#8fa7a0]">
            <button
              onClick={() => {
                hapticLight();
                setIsModalOpen(true);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white active:scale-90 transition touch-manipulation cursor-pointer"
              title="Add reminder"
              aria-label="Add reminder"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white active:scale-90 transition touch-manipulation cursor-pointer"
              title="Previous month"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white active:scale-90 transition touch-manipulation cursor-pointer"
              title="Next month"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Weekday Labels: S M T W T F S matching Image 5 */}
        <div className="grid grid-cols-7 text-center text-xs font-normal text-[#8fa7a0]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx}>{day}</div>
          ))}
        </div>

        {/* Days Grid matching Image 5 */}
        <div className="grid grid-cols-7 gap-y-3 text-center text-xs sm:text-sm">
          {calendarGrid.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return <div key={idx} className="h-10" />;
            }

            const isToday = cell.dateString === todayStr;
            const hasReminder = datesWithReminders.has(cell.dateString);
            const isSelected = selectedDay === cell.dateString;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  hapticSelection();
                  setSelectedDay((prev) => (prev === cell.dateString ? null : cell.dateString));
                }}
                className={`h-10 flex flex-col items-center justify-center rounded-xl transition ${
                  isSelected
                    ? 'bg-[#082a20] text-white font-bold'
                    : isToday
                    ? 'text-[#12332a] dark:text-white font-bold'
                    : 'text-[#5b7970] dark:text-[#8fa7a0] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>{cell.dayNumber}</span>
                {hasReminder && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#082a20] dark:bg-teal-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminders List or Bell Icon matching Frame 138s */}
      {displayedReminders.length === 0 ? (
        selectedDay ? (
          <div className="flex flex-col items-center justify-center text-center py-10 space-y-2 animate-in fade-in">
            <Bell className="w-7 h-7 text-[#8fa7a0] stroke-[1.5] opacity-50" />
            <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0]">
              No reminders scheduled for {selectedDay}.
            </p>
            <button
              type="button"
              onClick={() => {
                setReminderDate(selectedDay);
                setReminderTitle('');
                setIsModalOpen(true);
              }}
              className="text-xs font-semibold text-[#082a20] dark:text-teal-400 hover:underline pt-1"
            >
              + Schedule for this day
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 text-[#8fa7a0] opacity-40">
            <Bell className="w-8 h-8 stroke-[1.5]" />
          </div>
        )
      ) : (
        <div className="space-y-3">
          {displayedReminders.map((r) => {
            const isPast = r.date < todayStr;
            return (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(r.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                      r.completed
                        ? 'bg-[#0d2e26] border-[#0d2e26] text-white'
                        : 'border-gray-300 dark:border-white/20'
                    }`}
                  >
                    {r.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        r.completed
                          ? 'line-through text-gray-400'
                          : 'text-[#12332a] dark:text-white'
                      }`}
                    >
                      {r.title}
                    </p>
                    <span className="text-[10px] text-[#8fa7a0]">
                      {r.date} · {r.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPast && !r.completed && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      OVERDUE
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="p-1 text-gray-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Reminder Modal matching Frame 147s */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#fbfdfc] dark:bg-[#0c1e19] border border-[#dce9e3] dark:border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-[#12332a] dark:text-white">
                New Reminder
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]">
                  WHAT TO REMEMBER?
                </label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="e.g. Evening stillness, Drink water..."
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs bg-transparent text-[#12332a] dark:text-white focus:outline-none focus:border-[#0d2e26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]">
                    DATE
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs bg-transparent text-[#12332a] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]">
                    TIME
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs bg-transparent text-[#12332a] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0d2e26] hover:bg-[#15463a] text-white text-xs font-medium shadow-xs transition active:scale-[0.98]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
