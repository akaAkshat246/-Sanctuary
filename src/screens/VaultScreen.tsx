import React, { useState, useMemo, useRef } from 'react';
import {
  PlusIcon as Plus,
  TrashIcon as Trash2,
  UploadTrayIcon,
  CloseIcon as X,
  DownloadIcon as Download,
  MusicNoteIcon,
  ImageIcon,
  MindfulStarWithPlusIcon,
} from '../components/icons';
import type { MemoryItem, MemoryCategory } from '../types';
import { Storage } from '../lib/storage';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';

interface VaultScreenProps {
  memories: MemoryItem[];
  onRefresh: () => void;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES: MemoryCategory[] = ['IMAGE', 'VIDEO', 'AUDIO', 'PDF', 'DOC', 'OTHER'];

const POETIC_CAPTIONS = [
  'A fragment of silence preserved in memory.',
  'Moments dissolve, but the quiet echo of this hour remains.',
  'The beauty of what once touched the heart never truly fades.',
  'Held gently in the quiet vault of days gone by.',
  'A melody and image of inner peace, captured in time.',
  'Refuge found in the midst of life’s restless stream.',
];

export const VaultScreen: React.FC<VaultScreenProps> = ({ memories, onRefresh, showToast }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activePreview, setActivePreview] = useState<MemoryItem | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('IMAGE');
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    size: number;
    mime: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const detectCategory = (file: File): MemoryCategory => {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type.startsWith('video/')) return 'VIDEO';
    if (file.type.startsWith('audio/')) return 'AUDIO';
    if (file.type === 'application/pdf') return 'PDF';
    if (
      file.type.includes('word') ||
      file.type.includes('document') ||
      file.type.includes('text') ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.txt')
    ) {
      return 'DOC';
    }
    return 'OTHER';
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    hapticLight();
    const detected = detectCategory(file);
    setNewCategory(detected);
    if (!newTitle) {
      setNewTitle(file.name);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFile({
        url: event.target?.result as string,
        name: file.name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCaption = () => {
    hapticLight();
    const randomCaption = POETIC_CAPTIONS[Math.floor(Math.random() * POETIC_CAPTIONS.length)];
    setNewCaption(randomCaption);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      showToast?.('Please choose an image or file first', 'error');
      fileInputRef.current?.click();
      return;
    }

    hapticMedium();
    const memoryItem: MemoryItem = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim() || uploadedFile.name,
      type: newCategory,
      fileUrl: uploadedFile.url,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mime,
      caption: newCaption.trim(),
      isFavourite: false,
      createdAt: new Date().toISOString(),
    };

    await Storage.saveMemory(memoryItem);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewCaption('');
    setUploadedFile(null);
    onRefresh();
    hapticSuccess();
    showToast?.('Memory saved safely in vault');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this memory?')) {
      await Storage.deleteMemory(id);
      if (activePreview?.id === id) setActivePreview(null);
      onRefresh();
    }
  };

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.fileName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || m.type.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCategory;
    });
  }, [memories, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top Header Row matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
            Memory Vault
          </h1>
          <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] italic">
            Your safe space for precious moments.
          </p>
        </div>

        {/* Search Bar & Add Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memories..."
              className="pl-4 pr-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 text-xs text-[#12332a] dark:text-white placeholder-[#8fa7a0] focus:outline-none shadow-xs w-48 sm:w-64"
            />
          </div>

          <button
            onClick={() => {
              setNewTitle('');
              setNewCaption('');
              setUploadedFile(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#082a20] hover:bg-[#0c382b] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082a20]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills matching Image 3 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', ...CATEGORIES].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase transition-all ${
                isSelected
                  ? 'bg-white dark:bg-white/15 text-[#12332a] dark:text-white font-medium shadow-xs border border-[#dce9e3]/60'
                  : 'text-[#608075] dark:text-[#8fa7a0] hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Empty State matching Image 3 */}
      {filteredMemories.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 px-4 space-y-4">
          <div className="flex items-center justify-center text-[#334e45] dark:text-[#a0b8af]">
            <UploadTrayIcon className="w-16 h-16" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-2xl font-normal text-[#12332a] dark:text-white">
              Your vault is empty
            </h3>
            <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0]">
              Add your first memory to keep it safe forever.
            </p>
          </div>
          <button
            onClick={() => {
              setNewTitle('');
              setNewCaption('');
              setUploadedFile(null);
              setIsAddModalOpen(true);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#082a20] hover:bg-[#0c382b] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98]"
          >
            Add Memory
          </button>
        </div>
      ) : (
        /* Memory Grid matching Frame 126s */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              onClick={() => setActivePreview(m)}
              className="group aspect-square rounded-2xl bg-[#c5cfc9] dark:bg-white/10 relative overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition flex flex-col justify-between p-3"
            >
              {/* If image, display cover */}
              {m.type === 'IMAGE' ? (
                <img
                  src={m.fileUrl}
                  alt={m.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : m.type === 'AUDIO' ? (
                <div className="absolute inset-0 w-full h-full bg-[#f2f7f5] dark:bg-white/5 flex items-center justify-center text-[#5b7970]">
                  <MusicNoteIcon className="w-12 h-12 stroke-[1.5]" />
                </div>
              ) : null}

              {/* Top Left Badge */}
              <div className="relative z-10 self-start px-2.5 py-0.5 rounded-full bg-white/90 text-[#12332a] text-[10px] font-semibold uppercase shadow-xs">
                {m.type}
              </div>

              {/* Centered Trash Button */}
              <div className="relative z-10 flex items-center justify-center flex-1">
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, m.id)}
                  className="w-8 h-8 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center shadow-md transition transform active:scale-90"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Strip with Filename */}
              <div className="relative z-10 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white text-[11px] truncate">
                {m.title || m.fileName}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal matching Image 4 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1e19] border border-[#dce9e3] dark:border-white/10 rounded-[28px] p-6 sm:p-7 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-normal text-[#12332a] dark:text-white">
                New Memory
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              {/* File Preview Card matching Image 4 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl p-7 bg-[#f8faf9] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#12332a]/30 transition min-h-[140px] space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFilePicked}
                  className="hidden"
                />
                {uploadedFile ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-[#12332a] dark:text-white shadow-xs">
                      {newCategory === 'AUDIO' ? (
                        <MusicNoteIcon className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs text-[#5b7970] dark:text-[#8fa7a0] font-mono truncate max-w-xs">
                      {uploadedFile.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-1.5 text-[#5b7970] dark:text-[#8fa7a0]">
                    <UploadTrayIcon className="w-8 h-8 stroke-[1.8]" />
                    <span className="text-xs font-medium">
                      Tap or drop file to upload
                    </span>
                    <span className="text-[10px] text-[#8fa7a0]">
                      Images, videos, audio notes, and PDFs
                    </span>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8fa7a0] block">
                  TITLE
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Memory title"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce9e3] dark:border-white/10 text-xs bg-white dark:bg-transparent text-[#12332a] dark:text-white focus:outline-none focus:border-[#0d2e26]"
                />
              </div>

              {/* Caption Input with 'Generate poetic caption' button matching Image 4 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8fa7a0] block">
                    CAPTION (OPTIONAL)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCaption}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#5b7970] hover:text-[#12332a] dark:text-teal-400 dark:hover:text-teal-300 transition"
                  >
                    <MindfulStarWithPlusIcon className="w-3.5 h-3.5" />
                    <span>Generate poetic caption</span>
                  </button>
                </div>
                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  rows={3}
                  placeholder="Add a poetic caption..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce9e3] dark:border-white/10 text-xs bg-white dark:bg-transparent text-[#12332a] dark:text-white focus:outline-none focus:border-[#0d2e26] resize-none font-body leading-relaxed"
                />
              </div>

              {/* Action Buttons matching Image 4 */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-[#dce9e3] dark:border-white/10 text-[#12332a] dark:text-white text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadedFile}
                  className="px-6 py-2.5 rounded-xl bg-[#082a20] hover:bg-[#0c382b] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Preview */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0c1e19] border border-[#dce9e3] dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <h4 className="text-sm font-semibold truncate text-[#12332a] dark:text-white">
                  {activePreview.title}
                </h4>
                <p className="text-[10px] text-[#8fa7a0] font-mono">
                  {new Date(activePreview.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-black/30 rounded-2xl overflow-hidden">
              {activePreview.type === 'IMAGE' ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  <img
                    src={activePreview.fileUrl}
                    alt={activePreview.title}
                    className="max-h-[55vh] object-contain rounded-xl shadow-xs"
                  />
                  {activePreview.caption && (
                    <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] italic text-center font-quote px-4">
                      "{activePreview.caption}"
                    </p>
                  )}
                </div>
              ) : activePreview.type === 'VIDEO' ? (
                <div className="w-full space-y-3">
                  <video src={activePreview.fileUrl} controls className="max-h-[55vh] w-full rounded-xl" />
                  {activePreview.caption && (
                    <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] italic text-center font-quote px-4">
                      "{activePreview.caption}"
                    </p>
                  )}
                </div>
              ) : activePreview.type === 'AUDIO' ? (
                <div className="w-full space-y-3">
                  <audio src={activePreview.fileUrl} controls className="w-full" />
                  {activePreview.caption && (
                    <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] italic text-center font-quote px-4">
                      "{activePreview.caption}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center space-y-3 py-6">
                  <span className="text-xs text-[#5b7970] dark:text-[#8fa7a0] font-mono">
                    {activePreview.fileName}
                  </span>
                  {activePreview.caption && (
                    <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] italic text-center font-quote">
                      "{activePreview.caption}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={(e) => {
                  handleDelete(e, activePreview.id);
                  showToast?.('Memory removed from vault', 'info');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <a
                href={activePreview.fileUrl}
                download={activePreview.fileName || activePreview.title}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#082a20] hover:bg-[#0c382b] text-white text-xs font-medium shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
