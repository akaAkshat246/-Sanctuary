import React, { useState } from 'react';
import {
  BookmarkIcon as Bookmark,
  PlusIcon as Plus,
  ExternalLinkIcon as ExternalLink,
  TrashIcon as Trash2,
  GlobeIcon as Globe,
  CopyIcon as Copy,
  CheckIcon as Check,
} from '../components/icons';
import type { SavedLink } from '../types';
import { Storage } from '../lib/storage';

interface LinksScreenProps {
  links: SavedLink[];
  onRefresh: () => void;
  onBack: () => void;
}

export const LinksScreen: React.FC<LinksScreenProps> = ({
  links,
  onRefresh,
  onBack,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let validUrl = url.trim();
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = `https://${validUrl}`;
    }

    const newLink: SavedLink = {
      id: `lnk_${Date.now()}`,
      title: title.trim() || new URL(validUrl).hostname,
      url: validUrl,
      createdAt: new Date().toISOString(),
    };

    Storage.saveLink(newLink);
    onRefresh();
    setTitle('');
    setUrl('');
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    Storage.deleteLink(id);
    onRefresh();
  };

  const handleCopy = (id: string, targetUrl: string) => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
            <Bookmark className="w-5 h-5 text-[var(--color-gold)]" /> Saved Links
          </h2>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-medium shadow-xs hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      {isAddOpen && (
        <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-3">
          <h4 className="text-xs font-semibold text-[var(--color-on-surface)]">
            Save Web Link
          </h4>
          <input
            type="text"
            placeholder="Title (e.g. Favorite Kafka Essay)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none"
          />
          <input
            type="text"
            required
            placeholder="URL (e.g. https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[var(--color-on-surface-variant)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium"
            >
              Save Link
            </button>
          </div>
        </form>
      )}

      {links.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-2">
          <Globe className="w-10 h-10 text-[var(--color-gold)] mx-auto opacity-70" />
          <h4 className="font-heading font-semibold text-sm text-[var(--color-on-surface)]">
            No saved links yet
          </h4>
          <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
            Keep inspiring articles, readings, or quiet corners of the internet saved here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-between gap-3 shadow-xs hover:border-teal-500/40 transition-all"
            >
              <div className="min-w-0 flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] flex items-center gap-1.5 truncate"
                >
                  <span className="truncate">{link.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                </a>
                <span className="text-[10px] text-[var(--color-on-surface-variant)] truncate block mt-0.5">
                  {link.url}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleCopy(link.id, link.url)}
                  className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] transition-colors"
                  title="Copy Link"
                >
                  {copiedId === link.id ? (
                    <Check className="w-4 h-4 text-teal-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-rose-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
