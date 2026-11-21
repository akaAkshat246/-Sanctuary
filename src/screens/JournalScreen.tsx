import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plus, Search, Trash2, ArrowLeft, Sparkles, Tag, Check, Calendar, Edit3 } from 'lucide-react';
import type { JournalEntry, MoodType } from '../types';
import { Storage } from '../lib/storage';

interface JournalScreenProps {
  entries: JournalEntry[];
  onRefresh: () => void;
  initialEditingId?: string | null;
  onClearInitialEdit?: () => void;
}

const MOODS: { type: MoodType; label: string; symbol: string; color: string }[] = [
  { type: 'peaceful', label: 'Peaceful', symbol: '◇', color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' },
  { type: 'radiant', label: 'Radiant', symbol: '◈', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { type: 'contemplative', label: 'Contemplative', symbol: '⬖', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
  { type: 'tender', label: 'Tender', symbol: '◌', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { type: 'weary', label: 'Weary', symbol: '⬘', color: 'text-slate-400 border-slate-500/40 bg-slate-500/10' },
];

const POETIC_PROMPTS = [
  "What is a quiet sound that comforted you today, and why did it stay with you?",
  "Describe an object on your table as though Franz Kafka had placed it there in 1912.",
  "What feeling have you been keeping in the margin of your mind without giving it a name?",
  "Write about the light that falls through your window at this exact hour.",
  "If today were a single sentence written in a weathered notebook, what would it say?",
  "What would you tell your younger self if you met them for three minutes at twilight?",
  "What grief or worry are you ready to surrender to the quiet night?",
  "Recall a person whose voice made the world feel slightly less dangerous."
];

export const JournalScreen: React.FC<JournalScreenProps> = ({
  entries,
  onRefresh,
  initialEditingId = null,
  onClearInitialEdit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Find initial entry if targeted
  const initialEntry = useMemo(() => {
    return initialEditingId ? entries.find(e => e.id === initialEditingId) || null : null;
  }, [initialEditingId, entries]);

  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(initialEntry);
  const [isCreating, setIsCreating] = useState(Boolean(initialEntry));

  // Form states
  const [title, setTitle] = useState(() => initialEntry?.title || '');
  const [content, setContent] = useState(() => initialEntry?.content || '');
  const [mood, setMood] = useState<MoodType>(() => initialEntry?.mood || 'peaceful');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(() => initialEntry?.tags || []);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isInspiring, setIsInspiring] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startNewEntry = useCallback(() => {
    const draft = Storage.getDraft();
    setTitle(draft?.title || '');
    setContent(draft?.content || '');
    setMood('peaceful');
    setTags([]);
    setTagInput('');
    setEditingEntry(null);
    setIsCreating(true);
    onClearInitialEdit?.();
  }, [onClearInitialEdit]);

  const startEditing = useCallback((entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTags(entry.tags || []);
    setTagInput('');
    setEditingEntry(entry);
    setIsCreating(true);
    onClearInitialEdit?.();
  }, [onClearInitialEdit]);

  // Word count computation
  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [content]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isCreating && !editingEntry) return;

    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setInterval(() => {
      if (content || title) {
        Storage.saveDraft({ title, content });
        setSaveStatus('Draft auto-saved');
        setTimeout(() => setSaveStatus(''), 2500);
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [title, content, isCreating, editingEntry]);

  const handleSave = () => {
    if (!content.trim() && !title.trim()) return;

    const newOrUpdated: JournalEntry = {
      id: editingEntry ? editingEntry.id : `jnl_${Date.now()}`,
      title: title.trim() || 'Untitled Journal',
      content: content.trim(),
      mood,
      tags,
      createdAt: editingEntry ? editingEntry.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Storage.saveJournal(newOrUpdated);
    Storage.clearDraft();
    onRefresh();
    setIsCreating(false);
    setEditingEntry(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sacred entry?')) {
      Storage.deleteJournal(id);
      onRefresh();
      setIsCreating(false);
      setEditingEntry(null);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const fallbackPrompt = () => {
    const random = POETIC_PROMPTS[Math.floor(Math.random() * POETIC_PROMPTS.length)];
    setContent((prev) => (prev ? `${prev}\n\n[Prompt: ${random}]\n` : `[Prompt: ${random}]\n\n`));
  };

  const handleInspireMe = () => {
    setIsInspiring(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('sanctuary_gemini_key');
    if (apiKey) {
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Generate a short, hauntingly poetic journaling prompt in the tone of Franz Kafka or Rainer Maria Rilke. Max 2 sentences.',
                  },
                ],
              },
            ],
          }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generated) {
            setContent((prev) => (prev ? `${prev}\n\n[Prompt: ${generated.trim()}]\n` : `[Prompt: ${generated.trim()}]\n\n`));
          } else {
            fallbackPrompt();
          }
        })
        .catch(() => fallbackPrompt())
        .finally(() => setIsInspiring(false));
    } else {
      setTimeout(() => {
        fallbackPrompt();
        setIsInspiring(false);
      }, 300);
    }
  };

  // Filtered entries with debounce
  const filteredEntries = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [entries, searchTerm]);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* If Creating / Editing */}
      {isCreating ? (
        <div className="space-y-4">
          {/* Header navigation bar for editor */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Discard unsaved changes?')) {
                  setIsCreating(false);
                  setEditingEntry(null);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Journal
            </button>

            <div className="flex items-center gap-2">
              {saveStatus && (
                <span className="text-[11px] text-[var(--color-gold)] font-medium animate-pulse">
                  {saveStatus}
                </span>
              )}
              {editingEntry && (
                <button
                  onClick={() => handleDelete(editingEntry.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>

          {/* Mood Selector (5 moods, abstract shapes, no emoji) */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
            <div className="text-[11px] uppercase font-semibold text-[var(--color-on-surface-variant)] mb-2">
              Atmosphere & Inner Weather
            </div>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m.type}
                  onClick={() => setMood(m.type)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    mood === m.type
                      ? `${m.color} ring-2 ring-teal-500/40 font-semibold scale-102`
                      : 'border-[var(--color-surface-border)] bg-[var(--color-surface-variant)]/40 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]'
                  }`}
                >
                  <span className="text-base font-serif">{m.symbol}</span>
                  <span className="text-[10px] mt-0.5">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            placeholder="Title of this contemplation..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-heading font-semibold px-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-on-surface)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />

          {/* Gemini Inspire Me Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handleInspireMe}
              disabled={isInspiring}
              className="flex items-center gap-1.5 text-xs text-[var(--color-gold)] hover:text-[var(--color-gold-light)] font-medium transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isInspiring ? 'animate-spin' : ''}`} />
              {isInspiring ? 'Summoning muse...' : 'Inspire Me (Gemini Prompt)'}
            </button>

            <span className="text-[11px] font-mono text-[var(--color-on-surface-variant)]">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>

          {/* Content Editor */}
          <textarea
            placeholder="Let your thoughts flow freely. This sanctuary is completely private..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full text-sm font-body px-4 py-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-on-surface)] leading-relaxed placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-y"
          />

          {/* Tag Input */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-on-surface-variant)]">
              <Tag className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>Sanctuary Tags (comma or press enter)</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="glass-pill px-2.5 py-1 rounded-full text-xs text-[var(--color-primary)] font-medium flex items-center gap-1.5 border border-teal-500/20"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 text-[11px]"
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                onBlur={handleAddTag}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-variant)]/60 text-[var(--color-on-surface)] border-none focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Journal Entries List */
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-1">
            <div>
              <h2 className="text-xl font-heading font-semibold text-[var(--color-on-surface)]">
                Writing Space
              </h2>
              <p className="text-xs text-[var(--color-on-surface-variant)]">
                {entries.length} reflections recorded
              </p>
            </div>
          </div>

          {/* Search bar with debounce */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--color-on-surface-variant)] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search journals or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          {/* List of cards */}
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/10 text-[var(--color-primary)] flex items-center justify-center">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
                {searchTerm ? 'No matching reflections found' : 'The page awaits your words'}
              </h3>
              <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
                {searchTerm
                  ? 'Try searching with another keyword or mood tag.'
                  : 'Write your thoughts, dreams, or unburden your heart. Everything stays strictly on your device.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((item) => {
                const moodObj = MOODS.find((m) => m.type === item.mood);
                const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => startEditing(item)}
                    className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:border-teal-500/40 cursor-pointer shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-heading font-semibold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      {moodObj && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 font-serif ${moodObj.color}`}
                        >
                          {moodObj.symbol} {moodObj.label}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-surface-border)]/60 text-[10px] text-[var(--color-on-surface-variant)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[var(--color-gold)]" />
                        <span>{dateStr}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.tags?.slice(0, 3).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-[var(--color-surface-variant)]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Action Button (FAB) - 56px circle */}
          <button
            onClick={startNewEntry}
            aria-label="New Journal Entry"
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 z-30"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
