'use client';

import React, { useState, useEffect } from 'react';
import { DocumentRevisionInfo } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';
import {
  X,
  History,
  RotateCcw,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Loader2,
} from 'lucide-react';

interface VersionHistoryModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (revisionId: string) => Promise<void>;
  canEdit?: boolean;
}

export function VersionHistoryModal({
  documentId,
  isOpen,
  onClose,
  onRestore,
  canEdit = true,
}: VersionHistoryModalProps) {
  const { currentUser } = useAuth();
  const [revisions, setRevisions] = useState<DocumentRevisionInfo[]>([]);
  const [selectedRevision, setSelectedRevision] =
    useState<DocumentRevisionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [newSnapshotSummary, setNewSnapshotSummary] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRevisions();
    }
  }, [isOpen, documentId]);

  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/revisions`, {
        headers: { 'x-user-id': currentUser.id },
      });
      const data = await res.json();
      if (res.ok && data.revisions) {
        setRevisions(data.revisions);
        if (data.revisions.length > 0) {
          setSelectedRevision(data.revisions[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load version history', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotSummary.trim()) return;
    setIsCreatingSnapshot(true);

    try {
      const res = await fetch(`/api/documents/${documentId}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          summary: newSnapshotSummary.trim(),
        }),
      });

      if (res.ok) {
        setNewSnapshotSummary('');
        await fetchRevisions();
      }
    } catch (err) {
      console.error('Failed to create snapshot', err);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestoreClick = async () => {
    if (!selectedRevision) return;
    const confirmed = window.confirm(
      `Are you sure you want to restore the document to the version from ${new Date(
        selectedRevision.createdAt
      ).toLocaleString()}? A backup of your current content will be saved automatically.`
    );
    if (!confirmed) return;

    setIsRestoring(true);
    try {
      await onRestore(selectedRevision.id);
      onClose();
    } catch (err) {
      console.error('Error restoring version', err);
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#1c1d22] w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Document Version History
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Inspect snapshots and restore earlier versions with full safety backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Left sidebar (Revisions List) + Right pane (Snapshot Preview) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Revisions Timeline */}
          <div className="w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-800/30">
            {/* Create Snapshot input */}
            {canEdit && (
              <form
                onSubmit={handleCreateSnapshot}
                className="p-3 border-b border-gray-100 dark:border-gray-800 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Name this current version..."
                  value={newSnapshotSummary}
                  onChange={(e) => setNewSnapshotSummary(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={isCreatingSnapshot || !newSnapshotSummary.trim()}
                  className="p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 transition-colors"
                  title="Save manual snapshot"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Loading history...
                </div>
              ) : revisions.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No revisions recorded yet.
                </div>
              ) : (
                revisions.map((rev) => {
                  const isSelected = selectedRevision?.id === rev.id;
                  const date = new Date(rev.createdAt);
                  return (
                    <button
                      key={rev.id}
                      onClick={() => setSelectedRevision(rev)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-white dark:bg-[#1c1d22] border-brand-500 shadow-sm'
                          : 'bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">
                        <span className="truncate max-w-[170px]">
                          {rev.summary || rev.title}
                        </span>
                        <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {date.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center text-[9px] font-bold text-white">
                          {rev.savedBy?.name ? rev.savedBy.name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="text-[10px] text-gray-400 truncate">
                          {rev.savedBy?.name || 'System Auto-save'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Snapshot Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#18191e]">
            {selectedRevision ? (
              <>
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/40">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {selectedRevision.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Captured on {new Date(selectedRevision.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      onClick={handleRestoreClick}
                      disabled={isRestoring}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isRestoring ? 'Restoring...' : 'Restore this version'}</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="max-w-2xl mx-auto bg-white dark:bg-[#1c1d22] p-8 rounded-xl shadow-paper border border-gray-200 dark:border-gray-700">
                    <div
                      className="ProseMirror"
                      dangerouslySetInnerHTML={{
                        __html: selectedRevision.content || '<p>(Empty)</p>',
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                Select a revision on the left to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
