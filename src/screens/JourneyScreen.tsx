import React, { useState, useMemo } from 'react';
import { Compass, Calendar, Search, Feather } from 'lucide-react';
import type { JournalEntry } from '../types';

interface JourneyScreenProps {
  entries: JournalEntry[];
  onOpenJournal: (id: string) => void;
  onBack: () => void;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({
  entries,
  onOpenJournal,
  onBack,
}) => {
  const [search, setSearch] = useState('');

  // Stats calculation
  const totalEntries = entries.length;

  // Most common mood
  const mostCommonMood = useMemo(() => {
    if (entries.length === 0) return 'None';
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    let top = '';
    let max = 0;
    Object.entries(counts).forEach(([m, c]) => {
      if (c > max) {
        max = c;
        top = m;
      }
    });
    return top ? top.charAt(0).toUpperCase() + top.slice(1) : 'None';
  }, [entries]);

  // Group entries by month & year
  const grouped = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const filtered = search.trim()
      ? sorted.filter(
          (e) =>
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.content.toLowerCase().includes(search.toLowerCase())
        )
      : sorted;

    const map: Record<string, JournalEntry[]> = {};
    filtered.forEach((entry) => {
      const d = new Date(entry.createdAt);
      const key = d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
      if (!map[key]) map[key] = [];
      map[key].push(entry);
    });

    return map;
  }, [entries, search]);

  const getMoodDotColor = (mood: string) => {
    switch (mood) {
      case 'peaceful': return 'bg-teal-400 ring-teal-400/30';
      case 'radiant': return 'bg-amber-400 ring-amber-400/30';
      case 'contemplative': return 'bg-indigo-400 ring-indigo-400/30';
      case 'tender': return 'bg-rose-400 ring-rose-400/30';
      default: return 'bg-slate-400 ring-slate-400/30';
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pt-1">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] flex items-center gap-1 mb-1"
          >
            ← Back to Sanctuary
          </button>
          <h2 className="text-xl font-heading font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[var(--color-gold)]" /> Journey Timeline
          </h2>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-center shadow-xs">
        <div>
          <div className="text-base font-bold text-[var(--color-on-surface)]">{totalEntries}</div>
          <div className="text-[10px] text-[var(--color-on-surface-variant)]">Total Entries</div>
        </div>
        <div>
          <div className="text-base font-bold text-[var(--color-gold)]">
            {totalEntries > 0 ? `${Math.min(totalEntries, 14)} Days` : '0 Days'}
          </div>
          <div className="text-[10px] text-[var(--color-on-surface-variant)]">Reflection Streak</div>
        </div>
        <div>
          <div className="text-base font-bold text-teal-600">{mostCommonMood}</div>
          <div className="text-[10px] text-[var(--color-on-surface-variant)]">Top Mood</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-on-surface-variant)] absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter journey story..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        />
      </div>

      {/* Timeline Output */}
      {Object.keys(grouped).length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-2">
          <Feather className="w-10 h-10 text-[var(--color-gold)] mx-auto opacity-70" />
          <h4 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
            No journey entries yet
          </h4>
          <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
            As you write in your journal, your chronological story will unfold here month by month.
          </p>
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {Object.entries(grouped).map(([monthYear, items]) => (
            <div key={monthYear} className="space-y-3">
              <div className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--color-gold)] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{monthYear}</span>
                <div className="h-px bg-[var(--color-surface-border)] flex-1" />
              </div>

              {/* Vertical timeline items */}
              <div className="relative border-l-2 border-teal-500/20 ml-3.5 space-y-4 pl-5">
                {items.map((item) => {
                  const day = new Date(item.createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    weekday: 'short',
                  });

                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenJournal(item.id)}
                      className="group relative cursor-pointer"
                    >
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 transition-transform group-hover:scale-125 ${getMoodDotColor(
                          item.mood
                        )}`}
                      />

                      <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] group-hover:border-teal-500/40 transition-all shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[var(--color-gold)] font-mono">{day}</span>
                          <span className="capitalize text-[10px] text-[var(--color-on-surface-variant)]">
                            {item.mood}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
