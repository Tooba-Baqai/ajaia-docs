'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DocumentDetail, Role } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';
import {
  ArrowLeft,
  Cloud,
  CheckCircle2,
  Lock,
  Share2,
  Download,
  History,
  UploadCloud,
  FileText,
  Printer,
  FileCode,
  FileDown,
  Loader2,
  Users,
} from 'lucide-react';

interface EditorHeaderProps {
  document: DocumentDetail;
  saveStatus: 'saved' | 'saving' | 'error' | 'view_only';
  onTitleChange: (newTitle: string) => void;
  onOpenShare: () => void;
  onOpenUpload: () => void;
  onOpenHistory: () => void;
  onExport: (format: 'md' | 'html' | 'txt' | 'pdf') => void;
}

export function EditorHeader({
  document: doc,
  saveStatus,
  onTitleChange,
  onOpenShare,
  onOpenUpload,
  onOpenHistory,
  onExport,
}: EditorHeaderProps) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(doc.title || 'Untitled document');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(doc.title || 'Untitled document');
  }, [doc.title]);

  const canEdit = doc.canEdit !== false && doc.currentUserRole !== 'VIEWER';

  const handleTitleBlur = () => {
    const trimmed = title.trim() || 'Untitled document';
    setTitle(trimmed);
    if (trimmed !== doc.title) {
      onTitleChange(trimmed);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      titleInputRef.current?.blur();
    }
  };

  return (
    <header className="no-print bg-white dark:bg-[#18191e] border-b border-gray-200 dark:border-[#2d3139] px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors shadow-xs">
      {/* Left Section: Back link, App Logo, Editable Title, Save Status */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href="/"
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Back to Documents"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <FileText className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1 max-w-xl">
          <div className="flex items-center gap-2">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              disabled={!canEdit}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className={`font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base px-2 py-0.5 rounded-md border border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 bg-transparent truncate transition-all outline-none w-full max-w-md ${
                !canEdit ? 'cursor-not-allowed text-gray-600 dark:text-gray-400' : ''
              }`}
            />
          </div>

          {/* Sub-bar: Status Pill & Role info */}
          <div className="flex items-center gap-2 text-[11px] px-2 text-gray-500 dark:text-gray-400">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving to cloud...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>All changes saved to cloud</span>
              </span>
            )}
            {saveStatus === 'view_only' && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Lock className="w-3 h-3" />
                <span>View only mode</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-500">Failed to save changes</span>
            )}

            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              Role: {doc.currentUserRole || 'EDITOR'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Collaborator Avatars, History, Import, Export, Share */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Active Collaborator Avatars */}
        <div className="hidden md:flex items-center -space-x-1.5 mr-2">
          {/* Owner Avatar */}
          <div
            className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
            title={`Owner: ${doc.owner?.name || doc.owner?.email}`}
          >
            {doc.owner?.name ? doc.owner.name[0].toUpperCase() : 'O'}
          </div>

          {/* Collaborators */}
          {doc.shares?.slice(0, 3).map((share, idx) => (
            <div
              key={share.id || idx}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
              title={`${share.user?.name || share.user?.email} (${share.role})`}
            >
              {share.user?.name ? share.user.name[0].toUpperCase() : 'C'}
            </div>
          ))}

          {doc.shares && doc.shares.length > 3 && (
            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300 shadow-xs">
              +{doc.shares.length - 3}
            </div>
          )}
        </div>

        {/* Version History Button */}
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Document Version History"
        >
          <History className="w-4 h-4" />
        </button>

        {/* File Import Button (Only if editor) */}
        {canEdit && (
          <button
            onClick={onOpenUpload}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Import or Insert File (.docx, .md, .txt)"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        )}

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            title="Export document"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {isExportOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsExportOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1f2025] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    onExport('md');
                  }}
                  className="w-full px-3 py-2 text-xs text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-purple-500" />
                  Export as Markdown (.md)
                </button>
                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    onExport('html');
                  }}
                  className="w-full px-3 py-2 text-xs text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Export as HTML (.html)
                </button>
                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    onExport('txt');
                  }}
                  className="w-full px-3 py-2 text-xs text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <FileDown className="w-3.5 h-3.5 text-gray-500" />
                  Export Plain Text (.txt)
                </button>
                <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    onExport('pdf');
                  }}
                  className="w-full px-3 py-2 text-xs text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-500" />
                  Print / Save as PDF
                </button>
              </div>
            </>
          )}
        </div>

        {/* Share Button (Google Docs Signature Blue Button) */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {doc.isPublic ? (
            <Users className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          <span>Share</span>
          {doc.shares && doc.shares.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-brand-700 text-white rounded-full text-[10px] font-bold">
              {doc.shares.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
