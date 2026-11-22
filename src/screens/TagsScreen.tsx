import React, { useState, useMemo, useEffect } from 'react';
import { PlusIcon as Plus, TrashIcon as Trash2, CloseIcon as X } from '../components/icons';
import type { JournalEntry, TagItem } from '../types';
import { Storage } from '../lib/storage';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';

interface TagsScreenProps {
  entries: JournalEntry[];
  onOpenJournal: (id: string) => void;
}

const SWATCH_COLORS = [
  '#0d2e26', // Forest Green
  '#8c6828', // Gold / Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#22c55e', // Bright Green
  '#f59e0b', // Orange
  '#14b8a6', // Teal
];

export const TagsScreen: React.FC<TagsScreenProps> = ({ entries, onOpenJournal }) => {
  const [tags, setTags] = useState<TagItem[]>(() => Storage.getTags());
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);

  // Create Tag Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(SWATCH_COLORS[0]);

  const refreshTags = () => {
    const list = Storage.getTags();
    setTags(list);
    if (selectedTag) {
      const refreshed = list.find((t) => t.id === selectedTag.id);
      setSelectedTag(refreshed || null);
    }
  };

  useEffect(() => {
    refreshTags();
  }, []);

  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      e.tags?.forEach((t) => {
        const clean = t.toLowerCase().trim();
        if (clean) map[clean] = (map[clean] || 0) + 1;
      });
    });
    return map;
  }, [entries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagName.trim();
    if (!clean) return;

    hapticMedium();
    const newTag: TagItem = {
      id: `tag_${Date.now()}`,
      name: clean,
      color: tagColor,
      createdAt: new Date().toISOString(),
    };

    await Storage.saveTag(newTag);
    setTagName('');
    setIsModalOpen(false);
    refreshTags();
    hapticSuccess();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticMedium();
    await Storage.deleteTag(id);
    if (selectedTag?.id === id) setSelectedTag(null);
    refreshTags();
  };

  const activeTagEntries = useMemo(() => {
    if (!selectedTag) return [];
    const q = selectedTag.name.toLowerCase();
    return entries.filter((e) => e.tags?.some((t) => t.toLowerCase().trim() === q));
  }, [entries, selectedTag]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Top Header Row matching Frame 156s */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-3xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
          Tags
        </h1>

        <button
          onClick={() => {
            setTagName('');
            setIsModalOpen(true);
          }}
          className="w-8 h-8 rounded-full bg-[#0d2e26] hover:bg-[#15463a] text-white flex items-center justify-center shadow-xs transition active:scale-95"
          title="Create tag"
          aria-label="Create tag"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tags Cards or Empty State matching Frame 156s */}
      {tags.length === 0 ? (
        <div className="rounded-[28px] p-8 bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs text-center">
          <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0]">
            No tags yet. Create your first tag to organize your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tags.map((t) => {
              const count = tagCounts[t.name.toLowerCase()] || 0;
              const isSelected = selectedTag?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    hapticLight();
                    setSelectedTag((prev) => (prev?.id === t.id ? null : t));
                  }}
                  className={`p-4 rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border transition cursor-pointer shadow-xs flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#0d2e26] dark:border-white'
                      : 'border-[#dce9e3] dark:border-white/10 hover:border-[#12332a]/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: t.color || '#0d2e26' }}
                    />
                    <span className="text-xs font-medium text-[#12332a] dark:text-white">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-[#8fa7a0]">({count})</span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(t.id, e)}
                      className="text-rose-500 hover:text-rose-600 p-0.5 transition"
                      title="Delete tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section: ENTRIES TAGGED "NAME" matching Frame 168s */}
          {selectedTag && (
            <div className="space-y-3 pt-2 animate-in fade-in">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]">
                ENTRIES TAGGED "{selectedTag.name.toUpperCase()}"
              </h4>

              {activeTagEntries.length === 0 ? (
                <div className="rounded-2xl p-6 bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs">
                  <p className="text-xs text-[#8fa7a0]">No entries found for this tag.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeTagEntries.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => onOpenJournal(e.id)}
                      className="p-4 rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs hover:border-[#12332a]/30 cursor-pointer transition space-y-1"
                    >
                      <h5 className="text-xs font-semibold text-[#12332a] dark:text-white">
                        {e.title}
                      </h5>
                      <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] line-clamp-1">
                        {e.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Tag Modal matching Frame 159s */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#fbfdfc] dark:bg-[#0c1e19] border border-[#dce9e3] dark:border-white/10 rounded-[28px] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-[#12332a] dark:text-white">
                Create tag
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Tag name"
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs bg-transparent text-[#12332a] dark:text-white focus:outline-none focus:border-[#0d2e26]"
              />

              {/* 8 Circular Color Swatches matching Frame 159s */}
              <div className="flex items-center justify-between gap-1.5 py-1">
                {SWATCH_COLORS.map((color) => {
                  const isSelected = tagColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTagColor(color)}
                      className={`w-7 h-7 rounded-full transition transform active:scale-90 ${
                        isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0d2e26] hover:bg-[#15463a] text-white text-xs font-medium shadow-xs transition active:scale-[0.98]"
              >
                Create Tag
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
