'use client';

import React, { useState } from 'react';
import { DocumentListItem } from '../../lib/types';
import { DocumentCard } from './DocumentCard';
import { useAuth } from '../../lib/auth-context';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  UploadCloud,
  FilePlus,
  FolderOpen,
  Users,
  Shield,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface DocumentListProps {
  documents: DocumentListItem[];
  isLoading: boolean;
  onShare: (doc: DocumentListItem) => void;
  onDelete: (id: string) => void;
  onRename: (doc: DocumentListItem) => void;
  onDuplicate: (doc: DocumentListItem) => void;
  onOpenUpload: () => void;
  onCreateBlank: () => void;
  activeFilter: 'all' | 'owned' | 'shared';
  setActiveFilter: (filter: 'all' | 'owned' | 'shared') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DocumentList({
  documents,
  isLoading,
  onShare,
  onDelete,
  onRename,
  onDuplicate,
  onOpenUpload,
  onCreateBlank,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
}: DocumentListProps) {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const ownedCount = documents.filter(
    (d) => d.ownerId === currentUser.id || d.currentUserRole === 'OWNER'
  ).length;
  const sharedCount = documents.filter(
    (d) => d.ownerId !== currentUser.id && d.currentUserRole !== 'OWNER'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Controls Bar: Tabs, Search, View Mode, Import Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 self-start">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-[#1f2025] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            All Documents
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-gray-700">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('owned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'owned'
                ? 'bg-white dark:bg-[#1f2025] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Created by Me
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-gray-700">
              {ownedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('shared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'shared'
                ? 'bg-white dark:bg-[#1f2025] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Shared with Me
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-gray-700">
              {sharedCount}
            </span>
          </button>
        </div>

        {/* Search, View Mode, Import Button */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-xs"
            />
          </div>

          {/* Import Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1c1d22] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs transition-all"
            title="Import .docx, .md, or .txt file"
          >
            <UploadCloud className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Import File</span>
          </button>

          {/* Grid / Table Toggle */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1f2025] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#1f2025] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Table View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Grid / Table Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse border border-gray-200 dark:border-gray-800"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-[#1c1d22] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 shadow-sm">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {searchQuery
              ? 'No matching documents found'
              : activeFilter === 'shared'
              ? 'No documents shared with you yet'
              : 'No documents in your workspace'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find anything matching "${searchQuery}". Try a different keyword.`
              : activeFilter === 'shared'
              ? 'When other team members share documents with your persona, they will appear here.'
              : 'Get started by creating a new document or importing your existing markdown or docx files.'}
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={onCreateBlank}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create New Document</span>
            </button>
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import File</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onShare={onShare}
              onDelete={onDelete}
              onRename={onRename}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-[#1c1d22] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Access Role</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {documents.map((doc) => {
                const isOwner =
                  doc.ownerId === currentUser.id ||
                  doc.currentUserRole === 'OWNER';
                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/doc/${doc.id}`}
                        className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400"
                      >
                        <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{doc.title}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {isOwner ? 'You' : doc.owner?.name || doc.owner?.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          doc.currentUserRole === 'OWNER'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : doc.currentUserRole === 'EDITOR'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {doc.currentUserRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onShare(doc)}
                          className="px-2 py-1 rounded text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                        >
                          Share
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => onDelete(doc.id)}
                            className="px-2 py-1 rounded text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
