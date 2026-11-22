import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  PlusIcon as Plus,
  SearchIcon as Search,
  ArrowLeftIcon as ArrowLeft,
  MindfulStarWithPlusIcon,
  BookOpenIcon,
  SaveIcon,
} from '../components/icons';
import type { JournalEntry, JournalCategory } from '../types';
import { Storage } from '../lib/storage';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';

interface JournalScreenProps {
  entries: JournalEntry[];
  onRefresh: () => void;
  initialEditingId?: string | null;
  onClearInitialEdit?: () => void;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES: Array<{ type: JournalCategory; label: string }> = [
  { type: 'PEACEFUL', label: 'Peaceful' },
  { type: 'JOYFUL', label: 'Joyful' },
  { type: 'REFLECTIVE', label: 'Reflective' },
  { type: 'MELANCHOLIC', label: 'Melancholy' },
  { type: 'ENERGETIC', label: 'Energetic' },
];

const INSPIRE_PROMPTS = [
  "What is a quiet sound that comforted you today, and why did it stay with you?",
  "What feeling have you been keeping in the margin of your mind without giving it a name?",
  "Write about the light that falls through your window at this exact hour.",
  "If today were a single sentence written in a weathered notebook, what would it say?",
  "What would you tell your younger self if you met them for three minutes at twilight?",
  "What burden or worry are you ready to set down tonight?",
];

export const JournalScreen: React.FC<JournalScreenProps> = ({
  entries,
  onRefresh,
  initialEditingId = null,
  onClearInitialEdit,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const initialEntry = useMemo(() => {
    return initialEditingId ? entries.find((e) => e.id === initialEditingId) || null : null;
  }, [initialEditingId, entries]);

  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(initialEntry);
  const [isEditorOpen, setIsEditorOpen] = useState(Boolean(initialEntry));

  // Editor states
  const [title, setTitle] = useState(() => initialEntry?.title || '');
  const [content, setContent] = useState(() => initialEntry?.content || '');
  const [category, setCategory] = useState<JournalCategory>(
    () => (initialEntry?.mood as JournalCategory) || 'REFLECTIVE'
  );
  const [tagsInput, setTagsInput] = useState(() => (initialEntry?.tags || []).join(', '));

  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startNewEntry = useCallback(() => {
    const draft = Storage.getDraft();
    setTitle(draft?.title || '');
    setContent(draft?.content || '');
    setCategory('REFLECTIVE');
    setTagsInput('');
    setEditingEntry(null);
    setIsEditorOpen(true);
    onClearInitialEdit?.();
  }, [onClearInitialEdit]);

  const startEditing = useCallback(
    (entry: JournalEntry) => {
      setTitle(entry.title);
      setContent(entry.content);
      setCategory((entry.mood as JournalCategory) || 'REFLECTIVE');
      setTagsInput((entry.tags || []).join(', '));
      setEditingEntry(entry);
      setIsEditorOpen(true);
      onClearInitialEdit?.();
    },
    [onClearInitialEdit]
  );

  // Auto-save draft
  useEffect(() => {
    if (!isEditorOpen || editingEntry) return;

    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setInterval(() => {
      if (title || content) {
        Storage.saveDraft({ title, content });
      }
    }, 20000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [isEditorOpen, editingEntry, title, content]);

  const handleInspire = () => {
    hapticLight();
    const randomPrompt = INSPIRE_PROMPTS[Math.floor(Math.random() * INSPIRE_PROMPTS.length)];
    if (!content.trim()) {
      setContent(randomPrompt + '\n\n');
    } else {
      setContent((prev) => `${prev.trim()}\n\n- Prompt: ${randomPrompt}\n`);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    hapticMedium();
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const now = new Date().toISOString();
    const entryToSave: JournalEntry = {
      id: editingEntry?.id || `jnl_${Date.now()}`,
      title: title.trim() || 'Untitled Reflection',
      content: content.trim(),
      mood: category,
      tags: parsedTags,
      createdAt: editingEntry?.createdAt || now,
      updatedAt: now,
    };

    await Storage.saveJournal(entryToSave);
    Storage.clearDraft();
    setIsEditorOpen(false);
    setEditingEntry(null);
    onRefresh();
    hapticSuccess();
    showToast?.('Reflection saved to sanctuary');
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.tags && e.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCategory =
        selectedCategory === 'ALL' || e.mood.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCategory;
    });
  }, [entries, searchTerm, selectedCategory]);

  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [content]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {isEditorOpen ? (
        /* Full Journal Editor matching Frame 81s & 102s */
        <div className="relative min-h-[75vh] flex flex-col justify-between space-y-6 animate-in fade-in duration-200">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsEditorOpen(false);
                setEditingEntry(null);
              }}
              className="p-2 -ml-2 rounded-xl text-[#12332a] hover:opacity-75 dark:text-white transition"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>

            <button
              type="button"
              onClick={handleSaveEntry}
              className="px-5 py-2.5 rounded-2xl bg-[#587c6e] hover:bg-[#48665a] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition active:scale-[0.98]"
            >
              <SaveIcon className="w-4 h-4 stroke-[2]" />
              <span>Save Entry</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 space-y-6 pt-2">
            {/* Title Input matching Image 2 */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your thoughts..."
              className="w-full bg-transparent font-heading text-3xl sm:text-4xl text-[#12332a] dark:text-white placeholder-[#8fa7a0]/40 focus:outline-none transition tracking-wide"
            />

            {/* Floating Toolbar Capsule Pill matching Image 2 */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/60 dark:border-white/10 shadow-xs backdrop-blur-md">
                {CATEGORIES.map((c) => {
                  const isSelected = category === c.type;
                  return (
                    <button
                      key={c.type}
                      type="button"
                      onClick={() => setCategory(c.type)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition ${
                        isSelected
                          ? 'bg-white dark:bg-white/20 text-[#12332a] dark:text-white font-semibold shadow-xs'
                          : 'text-[#608075] dark:text-[#8fa7a0] hover:text-[#12332a] dark:hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="# Add tags (comma separated)"
                className="bg-white/70 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 dark:border-white/10 shadow-xs text-xs text-[#12332a] dark:text-white placeholder-[#8fa7a0] focus:outline-none min-w-[200px]"
              />
            </div>

            {/* Writing Canvas & Floating Inspire Button matching Image 2 */}
            <div className="relative pt-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                placeholder="What's on your mind today? Write freely..."
                className="w-full bg-transparent text-sm sm:text-base leading-relaxed text-[#12332a] dark:text-white placeholder-[#8fa7a0]/40 focus:outline-none resize-none font-body"
              />

              {/* Floating Inspire Me button on right matching Image 2 */}
              <button
                type="button"
                onClick={handleInspire}
                className="absolute right-0 top-6 px-4 py-2 rounded-2xl bg-white dark:bg-white/10 border border-white/70 dark:border-white/15 text-[#12332a] dark:text-white text-xs font-semibold shadow-xs flex items-center gap-2 hover:bg-[#f7faf9] transition"
              >
                <MindfulStarWithPlusIcon className="w-4 h-4 text-[#12332a] dark:text-teal-300" />
                <span>Inspire Me</span>
              </button>
            </div>
          </div>

          {/* Bottom Word Counter Pill matching Image 2 */}
          <div className="pt-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border border-white/60 dark:border-white/10 text-xs text-[#5b7970] dark:text-[#8fa7a0] font-mono shadow-xs">
              # {wordCount} {wordCount === 1 ? 'words' : 'words'}
            </span>
          </div>
        </div>
      ) : (
        /* Journal Archive View matching Frame 69s */
        <div className="space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold tracking-widest text-[#5b7970] uppercase">
                YOUR REFLECTIONS
              </span>
              <h1 className="text-3xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
                Journal Archive
              </h1>
            </div>

            {/* Search + New Entry Button */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reflections..."
                  className="pl-4 pr-9 py-2 rounded-xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 text-xs text-[#12332a] dark:text-white placeholder-[#8fa7a0] focus:outline-none shadow-xs w-48 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 text-[#8fa7a0] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="button"
                onClick={startNewEntry}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d2e26] hover:bg-[#15463a] text-white text-xs font-medium shadow-xs transition active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', ...CATEGORIES.map((c) => c.type)].map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    isSelected
                      ? 'bg-[#e5f0eb] dark:bg-white/15 text-[#12332a] dark:text-white font-medium shadow-xs'
                      : 'text-[#608075] dark:text-[#8fa7a0] hover:bg-[#eef5f2] dark:hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Empty State or Entries List */}
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 flex items-center justify-center text-[#5b7970] dark:text-[#8fa7a0] shadow-xs">
                <BookOpenIcon className="w-8 h-8 text-[#5b7970] dark:text-[#8fa7a0]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-2xl font-normal text-[#12332a] dark:text-white">
                  No reflections found
                </h3>
                <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0]">
                  Start capturing your thoughts and memories to see them here.
                </p>
              </div>
              {!searchTerm && (
                <button
                  onClick={startNewEntry}
                  className="px-5 py-2.5 rounded-xl bg-[#fbfdfc] dark:bg-white/10 border border-[#dce9e3] dark:border-white/15 text-[#12332a] dark:text-white text-xs font-medium shadow-xs hover:shadow transition"
                >
                  Write First Entry
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredEntries.map((entry) => {
                const dateDisplay = new Date(entry.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={entry.id}
                    onClick={() => startEditing(entry)}
                    className="p-5 rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 hover:border-[#12332a]/30 cursor-pointer transition space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#8fa7a0]">
                      <span className="uppercase tracking-wider font-semibold">
                        {entry.mood}
                      </span>
                      <span>{dateDisplay}</span>
                    </div>

                    <h3 className="font-heading text-lg font-normal text-[#12332a] dark:text-white">
                      {entry.title}
                    </h3>

                    <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {entry.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-[#f2f7f5] dark:bg-white/5 text-[#8fa7a0]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
