import React, { useMemo } from 'react';
import { PlusIcon as Plus } from '../components/icons';
import type { JournalEntry } from '../types';

interface JourneyScreenProps {
  entries: JournalEntry[];
  onOpenJournal: (id: string) => void;
  onNewEntry?: () => void;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({
  entries,
  onOpenJournal,
  onNewEntry,
}) => {
  // Group entries by month & year
  const grouped = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const map: Record<string, JournalEntry[]> = {};
    sorted.forEach((e) => {
      const d = new Date(e.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [entries]);

  const monthKeys = Object.keys(grouped);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300 max-w-4xl mx-auto relative min-h-[80vh]">
      {/* Top Header Row matching Frame 174s */}
      <div className="pt-1">
        <h1 className="text-3xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
          Your Journey
        </h1>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-[28px] p-8 bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs text-center">
          <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0]">
            No reflections yet. Write your first entry to begin your journey.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {monthKeys.map((month) => (
            <div key={month} className="space-y-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0] block">
                {month}
              </span>

              {/* Vertical timeline matching Frame 174s */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#8fa7a0]/30">
                {grouped[month].map((entry) => {
                  const d = new Date(entry.createdAt);
                  const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

                  return (
                    <div
                      key={entry.id}
                      onClick={() => onOpenJournal(entry.id)}
                      className="group relative p-5 rounded-[24px] bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs hover:border-[#12332a]/30 cursor-pointer transition space-y-2"
                    >
                      {/* Timeline Dot Node matching Frame 174s */}
                      <div className="absolute -left-[1.8rem] top-6 w-2.5 h-2.5 rounded-full bg-[#12332a] dark:bg-teal-400 ring-4 ring-[#ebf4f0] dark:ring-[#06120f]" />

                      {/* Header row with date pill & category pill */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-white/10 text-[#5b7970] dark:text-[#8fa7a0]">
                          {dateStr}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-white/10 text-[#5b7970] dark:text-[#8fa7a0] capitalize">
                          {entry.mood.toLowerCase()}
                        </span>
                      </div>

                      <h4 className="font-heading text-sm font-semibold text-[#12332a] dark:text-white">
                        {entry.title}
                      </h4>

                      <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating + New Entry button on bottom right matching Frame 174s */}
      {onNewEntry && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0d2e26] hover:bg-[#15463a] text-white text-xs font-medium shadow-lg transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      )}
    </div>
  );
};
