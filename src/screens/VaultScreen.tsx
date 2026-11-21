import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Search, Star, Trash2, X, Download, FileText, Music, Video,
  Image as ImageIcon, Grid, List
} from 'lucide-react';
import type { MemoryItem, MemoryFileType } from '../types';
import { Storage } from '../lib/storage';

interface VaultScreenProps {
  memories: MemoryItem[];
  onRefresh: () => void;
}

type FilterCategory = 'all' | 'photos' | 'videos' | 'audio' | 'docs' | 'favourites';

export const VaultScreen: React.FC<VaultScreenProps> = ({
  memories,
  onRefresh,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewItem, setPreviewItem] = useState<MemoryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File type detection
  const detectFileType = (file: File): MemoryFileType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'application/pdf') return 'pdf';
    return 'doc';
  };

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const detectedType = detectFileType(file);

      reader.onload = (event) => {
        const result = event.target?.result as string;
        const memory: MemoryItem = {
          id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: detectedType,
          fileUrl: result,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          isFavourite: false,
          createdAt: new Date().toISOString(),
        };
        Storage.saveMemory(memory);
        onRefresh();
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Toggle favourite
  const handleToggleFav = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    Storage.toggleMemoryFavourite(id);
    onRefresh();
  };

  // Delete memory
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this memory from your sanctuary?')) {
      Storage.deleteMemory(id);
      if (previewItem?.id === id) setPreviewItem(null);
      onRefresh();
    }
  };

  // Filter memories
  const filteredMemories = useMemo(() => {
    let result = memories;

    if (activeFilter === 'photos') result = result.filter((m) => m.type === 'image');
    else if (activeFilter === 'videos') result = result.filter((m) => m.type === 'video');
    else if (activeFilter === 'audio') result = result.filter((m) => m.type === 'audio');
    else if (activeFilter === 'docs') result = result.filter((m) => m.type === 'doc' || m.type === 'pdf');
    else if (activeFilter === 'favourites') result = result.filter((m) => m.isFavourite);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (m) => m.title.toLowerCase().includes(q) || m.fileName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [memories, activeFilter, searchTerm]);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getBadgeColor = (type: MemoryFileType) => {
    switch (type) {
      case 'image': return 'bg-teal-500/15 text-teal-600 border-teal-500/30';
      case 'video': return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
      case 'audio': return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case 'pdf': return 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30';
      default: return 'bg-slate-500/15 text-slate-600 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4 pb-24 overflow-x-hidden animate-in fade-in duration-300">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-heading font-semibold text-[var(--color-on-surface)]">
            Memory Vault
          </h2>
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            Private, uncompressed, on-device archive
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-surface-border)]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-teal-500/15 text-[var(--color-primary)]'
                : 'text-[var(--color-on-surface-variant)]'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-teal-500/15 text-[var(--color-primary)]'
                : 'text-[var(--color-on-surface-variant)]'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-on-surface-variant)] absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search saved memories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        />
      </div>

      {/* Filter Chips Bar (No horizontal scroll break) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {[
          { id: 'all', label: 'All' },
          { id: 'photos', label: 'Photos' },
          { id: 'videos', label: 'Videos' },
          { id: 'audio', label: 'Audio' },
          { id: 'docs', label: 'Docs' },
          { id: 'favourites', label: 'Starred' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveFilter(chip.id as FilterCategory)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === chip.id
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Memories View */}
      {filteredMemories.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/10 text-[var(--color-primary)] flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
            No memories here yet
          </h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
            Store photos, family videos, audio recordings, or important documents with full privacy.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-medium shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add First Memory
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* 2-Column Staggered Grid */
        <div className="grid grid-cols-2 gap-3">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              onClick={() => setPreviewItem(m)}
              className="group relative rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] overflow-hidden shadow-xs hover:border-teal-500/40 cursor-pointer transition-all hover:scale-[1.02]"
            >
              {/* Media Preview Thumbnail */}
              <div className="aspect-square w-full bg-[var(--color-surface-variant)] relative overflow-hidden flex items-center justify-center">
                {m.type === 'image' ? (
                  <img
                    src={m.fileUrl}
                    alt={m.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : m.type === 'video' ? (
                  <div className="flex flex-col items-center justify-center text-rose-500 p-2">
                    <Video className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">Video</span>
                  </div>
                ) : m.type === 'audio' ? (
                  <div className="flex flex-col items-center justify-center text-amber-500 p-2">
                    <Music className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">Audio</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-indigo-500 p-2">
                    <FileText className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">Document</span>
                  </div>
                )}

                {/* Badge Overlay */}
                <span
                  className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider backdrop-blur-xs ${getBadgeColor(
                    m.type
                  )}`}
                >
                  {m.type}
                </span>

                {/* Star Button */}
                <button
                  onClick={(e) => handleToggleFav(e, m.id)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
                    m.isFavourite
                      ? 'bg-amber-400 text-amber-950 scale-110 shadow-sm'
                      : 'bg-black/30 text-white/80 hover:scale-110'
                  }`}
                  aria-label="Favorite"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Title & Size */}
              <div className="p-2.5">
                <div className="text-xs font-semibold text-[var(--color-on-surface)] truncate">
                  {m.title}
                </div>
                <div className="text-[10px] text-[var(--color-on-surface-variant)] mt-0.5 flex items-center justify-between">
                  <span>{formatSize(m.fileSize)}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Single-Column List View */
        <div className="space-y-2">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              onClick={() => setPreviewItem(m)}
              className="p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:border-teal-500/40 cursor-pointer flex items-center justify-between gap-3 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center shrink-0 overflow-hidden">
                  {m.type === 'image' ? (
                    <img src={m.fileUrl} alt={m.title} className="w-full h-full object-cover" />
                  ) : m.type === 'video' ? (
                    <Video className="w-5 h-5 text-rose-500" />
                  ) : m.type === 'audio' ? (
                    <Music className="w-5 h-5 text-amber-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-indigo-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[var(--color-on-surface)] truncate">
                    {m.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-on-surface-variant)] mt-0.5">
                    <span className={`px-1 rounded text-[8px] font-bold uppercase border ${getBadgeColor(m.type)}`}>
                      {m.type}
                    </span>
                    <span>{formatSize(m.fileSize)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => handleToggleFav(e, m.id)}
                  className={`p-2 rounded-xl transition-all ${
                    m.isFavourite ? 'text-amber-500' : 'text-[var(--color-on-surface-variant)] hover:text-amber-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${m.isFavourite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, m.id)}
                  className="p-2 rounded-xl text-[var(--color-on-surface-variant)] hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Vault FAB - 56px circle */}
      <button
        onClick={() => fileInputRef.current?.click()}
        aria-label="Add Memory"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-neutral-900 shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 z-30"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Fullscreen Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-surface-border)]">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm font-semibold text-[var(--color-on-surface)] truncate font-heading">
                  {previewItem.title}
                </h3>
                <span className="text-[10px] text-[var(--color-on-surface-variant)]">
                  {formatSize(previewItem.fileSize)} · {new Date(previewItem.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewItem.fileUrl}
                  download={previewItem.fileName}
                  className="p-2 rounded-xl bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]/80 transition-colors"
                  title="Download / Save"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={(e) => handleDelete(e, previewItem.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/20">
              {previewItem.type === 'image' ? (
                <img
                  src={previewItem.fileUrl}
                  alt={previewItem.title}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              ) : previewItem.type === 'video' ? (
                <video
                  src={previewItem.fileUrl}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full rounded-xl"
                />
              ) : previewItem.type === 'audio' ? (
                <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Music className="w-8 h-8" />
                  </div>
                  <div className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
                    {previewItem.title}
                  </div>
                  <audio src={previewItem.fileUrl} controls className="w-full" />
                </div>
              ) : (
                <div className="p-8 text-center space-y-4 max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                  <div className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
                    {previewItem.fileName}
                  </div>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    Secure on-device document. You can open or download it to view in your device reader.
                  </p>
                  <a
                    href={previewItem.fileUrl}
                    download={previewItem.fileName}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download to Device
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
