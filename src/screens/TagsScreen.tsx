import React, { useState, useMemo } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import type { JournalEntry } from '../types';

interface TagsScreenProps {
  entries: JournalEntry[];
  onOpenJournal: (id: string) => void;
  onBack: () => void;
}

const PRESET_COLORS = [
  '#1a4a4a', // Deep Teal
  '#c9a84c', // Gold
  '#e06c75', // Rose
  '#61afef', // Sky Blue
  '#98c379', // Sage Green
  '#c678dd', // Lavender
  '#d19a66', // Terracotta
  '#56b6c2', // Aqua
];

export const TagsScreen: React.FC<TagsScreenProps> = ({
  entries,
  onOpenJournal,
  onBack,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Aggregate all tags from entries
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      e.tags?.forEach((t) => {
        const clean = t.toLowerCase().trim();
        if (clean) {
          map[clean] = (map[clean] || 0) + 1;
        }
      });
    });
    return map;
  }, [entries]);

  const allTags = Object.keys(tagCounts);

  // Filter entries if a tag is selected
  const filteredEntries = useMemo(() => {
    if (!selectedTag) return [];
    return entries.filter((e) =>
      e.tags?.some((t) => t.toLowerCase().trim() === selectedTag.toLowerCase())
    );
  }, [entries, selectedTag]);

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
            <TagIcon className="w-5 h-5 text-[var(--color-gold)]" /> Sanctuary Tags
          </h2>
        </div>
      </div>

      {/* Selected Tag Filter Banner */}
      {selectedTag ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-primary)] bg-teal-500/15 px-2.5 py-1 rounded-full border border-teal-500/20">
                #{selectedTag}
              </span>
              <span className="text-xs text-[var(--color-on-surface-variant)]">
                ({filteredEntries.length} entries)
              </span>
            </div>
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs text-[var(--color-on-surface-variant)] hover:text-rose-500 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear Filter
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredEntries.map((e) => (
              <div
                key={e.id}
                onClick={() => onOpenJournal(e.id)}
                className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:border-teal-500/40 cursor-pointer transition-all shadow-xs"
              >
                <h4 className="text-xs font-semibold text-[var(--color-on-surface)]">{e.title}</h4>
                <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2 mt-1">
                  {e.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tag Cloud Grid */
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            Tags organize your thoughts, dreams, and memories. Tap any tag to explore matching writings.
          </p>

          {allTags.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-2">
              <TagIcon className="w-10 h-10 text-[var(--color-gold)] mx-auto opacity-70" />
              <h4 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
                No tags created yet
              </h4>
              <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
                When you write journal entries, add tags like <i>#solitude</i>, <i>#books</i>, or <i>#ideas</i> to see them grouped here.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {allTags.map((t, idx) => {
                const color = PRESET_COLORS[idx % PRESET_COLORS.length];
                const count = tagCounts[t];

                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className="p-2.5 px-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xs group"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-medium text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)]">
                      #{t}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
