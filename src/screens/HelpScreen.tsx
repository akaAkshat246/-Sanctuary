import React, { useState } from 'react';
import {
  HelpIcon as HelpCircle,
  ChevronDownIcon as ChevronDown,
  ChevronUpIcon as ChevronUp,
  MailIcon as Mail,
  MessageSquareIcon as MessageSquare,
  ShieldIcon as Shield,
  BookOpenIcon as BookOpen,
  DatabaseIcon as HardDrive,
  BellIcon as Bell,
} from '../components/icons';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export const HelpScreen: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Is my data stored on the cloud?",
      answer: "No. Sanctuary is completely offline-first. Your reflections, mood logs, tags, and memory vault files reside exclusively on your device's native sandboxed storage.",
      icon: <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
    },
    {
      question: "How do I use the Journal Archive & Inspire Me?",
      answer: "Tap '+ New Entry' to start writing. You can choose a mood category, add tags, and tap 'Inspire Me' whenever you're looking for an evocative writing prompt.",
      icon: <BookOpen className="w-4 h-4 text-amber-500" />
    },
    {
      question: "What files can I store in the Memory Vault?",
      answer: "The Vault supports Photos (JPG, PNG, WebP), Videos (MP4, WebM), Audio recordings (MP3, WAV, AAC), and Documents/PDFs with fullscreen playback and poetic caption generation.",
      icon: <HardDrive className="w-4 h-4 text-sky-500" />
    },
    {
      question: "How do offline reminders work?",
      answer: "You can schedule gentle reminders with specific dates and times. Sanctuary tracks upcoming tasks and alerts you if any item is overdue.",
      icon: <Bell className="w-4 h-4 text-indigo-500" />
    },
    {
      question: "How do I backup or transfer my data?",
      answer: "Go to Settings or Profile and tap 'Export My Data'. This generates a complete JSON backup of all your journals, reminders, and settings that you can safely store anywhere.",
      icon: <HelpCircle className="w-4 h-4 text-pink-500" />
    }
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1 pt-2">
        <span className="text-[11px] font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase">
          SUPPORT & GUIDANCE
        </span>
        <h1 className="text-3xl font-heading font-semibold tracking-tight text-[var(--color-on-surface)]">
          Help & FAQs
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-mid)]">
          Answers to common questions about using your mindful digital sanctuary.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] overflow-hidden shadow-xs transition"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left transition hover:bg-[var(--color-surface-variant)]/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                    {faq.icon}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-on-surface)]">
                    {faq.question}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[var(--color-text-light)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--color-text-light)]" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs text-[var(--color-text-mid)] font-body leading-relaxed border-t border-[var(--color-surface-border)]/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-5 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-[var(--color-on-surface)]">
            Community Sanctuary
          </h4>
          <p className="text-xs text-[var(--color-text-mid)] leading-relaxed">
            Connect with other mindful explorers sharing thoughts and reflections.
          </p>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline pt-1"
          >
            Join Discord Community →
          </a>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-[var(--color-on-surface)]">
            Contact Support
          </h4>
          <p className="text-xs text-[var(--color-text-mid)] leading-relaxed">
            Need direct help or have feedback? Reach out directly.
          </p>
          <a
            href="mailto:support@sanctuary.app"
            className="inline-block text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline pt-1"
          >
            Email Support →
          </a>
        </div>
      </div>
    </div>
  );
};

