'use client';

import React, { useState } from 'react';
import { DocumentDetail, DocumentListItem, Role } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';
import { SEEDED_USERS } from '../../lib/seed-users';
import {
  X,
  Share2,
  UserPlus,
  Link2,
  Check,
  Trash2,
  Globe,
  Lock,
  ChevronDown,
  Shield,
  Eye,
  Edit3,
  Sparkles,
} from 'lucide-react';

interface ShareModalProps {
  document: DocumentDetail | DocumentListItem;
  isOpen: boolean;
  onClose: () => void;
  onShareUpdated?: () => void;
}

export function ShareModal({
  document: doc,
  isOpen,
  onClose,
  onShareUpdated,
}: ShareModalProps) {
  const { currentUser } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Collaborators list state
  const [shares, setShares] = useState<any[]>(
    'shares' in doc && Array.isArray(doc.shares) ? doc.shares : []
  );
  const [isPublic, setIsPublic] = useState(doc.isPublic);
  const [publicRole, setPublicRole] = useState(doc.publicRole || 'VIEWER');

  if (!isOpen) return null;

  const isOwner =
    doc.ownerId === currentUser.id ||
    ('currentUserRole' in doc && doc.currentUserRole === 'OWNER');

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/documents/${doc.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add collaborator');
      }

      setSuccessMessage(`Granted ${inviteRole} access to ${inviteEmail}`);
      setInviteEmail('');

      // Refresh shares
      const updatedShare = data.share;
      setShares((prev) => {
        const filtered = prev.filter((s) => s.userId !== updatedShare.userId);
        return [...filtered, updatedShare];
      });

      if (onShareUpdated) onShareUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sharing document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'EDITOR' | 'VIEWER') => {
    try {
      const targetShare = shares.find((s) => s.userId === userId);
      if (!targetShare) return;

      const res = await fetch(`/api/documents/${doc.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      if (res.ok) {
        setShares((prev) =>
          prev.map((s) => (s.userId === userId ? { ...s, role: newRole } : s))
        );
        if (onShareUpdated) onShareUpdated();
      }
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/documents/${doc.id}/share?userId=${encodeURIComponent(userId)}`,
        {
          method: 'DELETE',
          headers: { 'x-user-id': currentUser.id },
        }
      );

      if (res.ok) {
        setShares((prev) => prev.filter((s) => s.userId !== userId));
        if (onShareUpdated) onShareUpdated();
      }
    } catch (err) {
      console.error('Failed to remove collaborator', err);
    }
  };

  const handleTogglePublicLink = async (nextPublic: boolean) => {
    try {
      setIsPublic(nextPublic);
      await fetch(`/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          isPublic: nextPublic,
          publicRole,
        }),
      });
      if (onShareUpdated) onShareUpdated();
    } catch (err) {
      console.error('Failed to update public setting', err);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/doc/${doc.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#1c1d22] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Share "{doc.title || 'Untitled'}"
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage who can view or edit this document
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Add People Form */}
          {isOwner ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Add People &amp; Teams
              </label>
              <form onSubmit={handleAddCollaborator} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter email or pick below..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as 'EDITOR' | 'VIEWER')
                  }
                  className="text-xs font-medium px-2.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={isSubmitting || !inviteEmail.trim()}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite</span>
                </button>
              </form>

              {/* Quick Persona Pills for Reviewers */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-gray-400">Quick invite:</span>
                {SEEDED_USERS.filter((u) => u.id !== doc.ownerId).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setInviteEmail(u.email)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-gray-700 dark:text-gray-300 hover:text-brand-600 transition-colors"
                  >
                    +{u.name.split(' ')[0]} ({u.email})
                  </button>
                ))}
              </div>

              {errorMessage && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg">
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                  {successMessage}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              Only the document owner can invite new collaborators or change access rules.
            </div>
          )}

          {/* Collaborator List */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              People with Access
            </label>
            <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
              {/* Owner Item */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    {doc.owner?.name ? doc.owner.name[0].toUpperCase() : 'O'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      {doc.owner?.name || doc.owner?.email}
                      {doc.ownerId === currentUser.id && (
                        <span className="text-[9px] text-gray-400 font-normal">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {doc.owner?.email}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  Owner
                </span>
              </div>

              {/* Shared Collaborators */}
              {shares.map((share) => (
                <div
                  key={share.id || share.userId}
                  className="flex items-center justify-between py-2 pt-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                      {share.user?.name
                        ? share.user.name[0].toUpperCase()
                        : share.user?.email
                        ? share.user.email[0].toUpperCase()
                        : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        {share.user?.name || share.user?.email}
                        {share.userId === currentUser.id && (
                          <span className="text-[9px] text-brand-600 dark:text-brand-400 font-normal">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {share.user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <select
                          value={share.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              share.userId,
                              e.target.value as 'EDITOR' | 'VIEWER'
                            )
                          }
                          className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRemoveCollaborator(share.userId)}
                          title="Revoke access"
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {share.role === 'EDITOR' ? 'Editor' : 'Viewer'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Access / Link Sharing */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              General Access
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  {isPublic ? (
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {isPublic ? 'Anyone with the link' : 'Restricted'}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isPublic
                      ? 'Anyone on the internet with this link can view'
                      : 'Only invited collaborators can access this document'}
                  </div>
                </div>
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => handleTogglePublicLink(!isPublic)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {isPublic ? 'Make Restricted' : 'Enable Link'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Copy Link */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-xl hover:bg-brand-100 transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Copy Shareable Link</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
