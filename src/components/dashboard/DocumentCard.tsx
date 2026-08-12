'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DocumentListItem } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';
import {
  FileText,
  MoreVertical,
  Share2,
  Trash2,
  Edit3,
  Copy,
  Clock,
  Shield,
  Eye,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface DocumentCardProps {
  document: DocumentListItem;
  onShare: (doc: DocumentListItem) => void;
  onDelete: (id: string) => void;
  onRename: (doc: DocumentListItem) => void;
  onDuplicate: (doc: DocumentListItem) => void;
}

export function DocumentCard({
  document,
  onShare,
  onDelete,
  onRename,
  onDuplicate,
}: DocumentCardProps) {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner = document.ownerId === currentUser.id || document.currentUserRole === 'OWNER';
  const isEditor = document.currentUserRole === 'EDITOR';
  const isViewer = document.currentUserRole === 'VIEWER';

  // Format relative date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="group relative bg-white dark:bg-[#1c1d22] rounded-xl border border-gray-200 dark:border-gray-700/70 hover:border-brand-500/80 dark:hover:border-brand-400/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {/* Top Preview Area */}
      <Link
        href={`/doc/${document.id}`}
        className="p-4 sm:p-5 flex-1 block focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          {/* Access / Role Badge */}
          <div className="flex items-center gap-1.5">
            {isOwner ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Owner
              </span>
            ) : isEditor ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Edit3 className="w-3 h-3" />
                Can Edit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Eye className="w-3 h-3" />
                View Only
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-sm sm:text-base line-clamp-1">
          {document.title || 'Untitled document'}
        </h3>

        {/* Snippet preview */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
          {document.plainText || 'No additional text in document...'}
        </p>
      </Link>

      {/* Footer Info & Actions */}
      <div className="px-4 py-3 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {/* Owner Avatar */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
            style={{
              backgroundColor:
                document.ownerId === currentUser.id ? '#0e8fe5' : '#8b5cf6',
            }}
            title={`Owner: ${document.owner?.name || document.owner?.email}`}
          >
            {document.owner?.name
              ? document.owner.name.substring(0, 1).toUpperCase()
              : 'U'}
          </div>
          <span className="truncate max-w-[90px] sm:max-w-[120px]">
            {document.ownerId === currentUser.id
              ? 'You'
              : document.owner?.name || document.owner?.email}
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {formatDate(document.updatedAt)}
          </span>
        </div>

        {/* Action Menu Trigger */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(!menuOpen);
            }}
            aria-label="Document options"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors focus:outline-none"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Context Dropdown */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-[#1f2025] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onShare(document);
                  }}
                  className="w-full px-3 py-2 text-xs text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  Share Document
                </button>

                {isOwner && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(document);
                    }}
                    className="w-full px-3 py-2 text-xs text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    Rename Title
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(document);
                  }}
                  className="w-full px-3 py-2 text-xs text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  Make a Copy
                </button>

                {isOwner && (
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(document.id);
                      }}
                      className="w-full px-3 py-2 text-xs text-left font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Document
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
