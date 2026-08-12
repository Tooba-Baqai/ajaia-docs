'use client';

import React, { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { EditorHeader } from '../../../components/editor/EditorHeader';
import { EditorCanvas } from '../../../components/editor/EditorCanvas';
import { ShareModal } from '../../../components/sharing/ShareModal';
import { FileUploadModal } from '../../../components/upload/FileUploadModal';
import { VersionHistoryModal } from '../../../components/editor/VersionHistoryModal';
import { useAuth } from '../../../lib/auth-context';
import { DocumentDetail } from '../../../lib/types';
import { htmlToMarkdown, extractPlainText } from '../../../lib/file-parsers';
import { Lock, ArrowLeft, ShieldAlert, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, isLoading: authLoading } = useAuth();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'error' | 'view_only'
  >('saved');

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const editorInstanceRef = useRef<any>(null);

  // Fetch document with active user credentials
  const fetchDocument = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setAccessError(null);

    try {
      const res = await fetch(`/api/documents/${id}`, {
        headers: {
          'x-user-id': currentUser.id,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setAccessError(
          data.error || 'You do not have permission to view this document.'
        );
        return;
      }

      setDocument(data.document);
      if (data.document.currentUserRole === 'VIEWER') {
        setSaveStatus('view_only');
      } else {
        setSaveStatus('saved');
      }
    } catch (err: any) {
      console.error('Error loading document', err);
      setAccessError('Failed to communicate with server.');
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchDocument();
    }
  }, [authLoading, currentUser, fetchDocument]);

  // Handle autosave of rich-text content
  const handleContentChange = async (html: string) => {
    if (!document) return;
    if (document.currentUserRole === 'VIEWER' || document.canEdit === false) {
      setSaveStatus('view_only');
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          content: html,
        }),
      });

      if (res.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to autosave document', err);
      setSaveStatus('error');
    }
  };

  // Handle document title renaming
  const handleTitleChange = async (newTitle: string) => {
    if (!document) return;
    if (document.currentUserRole === 'VIEWER' || document.canEdit === false) {
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      if (res.ok) {
        setDocument((prev) => (prev ? { ...prev, title: newTitle } : null));
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to rename title', err);
      setSaveStatus('error');
    }
  };

  // Insert parsed content into active editor
  const handleInsertFileContent = (htmlContent: string) => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.commands.insertContent(htmlContent);
    }
  };

  // Export handlers
  const handleExport = (format: 'md' | 'html' | 'txt' | 'pdf') => {
    if (!document) return;

    if (format === 'pdf') {
      window.print();
      return;
    }

    let fileData = '';
    let fileName = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    let mimeType = 'text/plain';

    if (format === 'md') {
      fileData = `# ${document.title}\n\n` + htmlToMarkdown(document.content);
      fileName += '.md';
      mimeType = 'text/markdown';
    } else if (format === 'html') {
      fileData = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1 { font-size: 2.2rem; }
    blockquote { border-left: 4px solid #3b82f6; margin: 0; padding-left: 1rem; color: #4b5563; }
    pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; }
  </style>
</head>
<body>
  <h1>${document.title}</h1>
  ${document.content}
</body>
</html>`;
      fileName += '.html';
      mimeType = 'text/html';
    } else if (format === 'txt') {
      fileData = `${document.title}\n\n` + extractPlainText(document.content);
      fileName += '.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([fileData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = fileName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore revision handler
  const handleRestoreRevision = async (revisionId: string) => {
    if (!document) return;
    try {
      const res = await fetch(`/api/documents/${document.id}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          action: 'restore',
          revisionId,
        }),
      });

      if (res.ok) {
        await fetchDocument();
      }
    } catch (err) {
      console.error('Failed to restore revision', err);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-docbg-canvas dark:bg-docbg-canvasDark">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Opening document workspace...
          </p>
        </div>
      </div>
    );
  }

  // Access Denied Screen
  if (accessError || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-docbg-canvas dark:bg-docbg-canvasDark p-4">
        <div className="bg-white dark:bg-[#1c1d22] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Access Restricted
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            {accessError || 'You do not have permission to view this document.'}
          </p>
          <p className="text-[11px] text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/80 p-2 rounded-lg">
            Current active persona: <strong>{currentUser?.name}</strong> ({currentUser?.email})
          </p>

          <div className="flex gap-2 justify-center mt-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Documents</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isReadOnly =
    document.currentUserRole === 'VIEWER' || document.canEdit === false;

  return (
    <div className="min-h-screen flex flex-col bg-docbg-canvas dark:bg-docbg-canvasDark transition-colors">
      {/* Google Docs Top Header */}
      <EditorHeader
        document={document}
        saveStatus={saveStatus}
        onTitleChange={handleTitleChange}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onExport={handleExport}
      />

      {/* Main Google Docs Paper Canvas */}
      <main className="flex-1 flex flex-col">
        <EditorCanvas
          initialContent={document.content}
          readOnly={isReadOnly}
          onContentChange={handleContentChange}
          onEditorReady={(ed) => {
            editorInstanceRef.current = ed;
          }}
        />
      </main>

      {/* Share Modal */}
      <ShareModal
        document={document}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShareUpdated={fetchDocument}
      />

      {/* File Upload / Ingest Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onInsertContent={handleInsertFileContent}
        currentDocId={document.id}
      />

      {/* Version History Drawer */}
      <VersionHistoryModal
        documentId={document.id}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreRevision}
        canEdit={!isReadOnly}
      />
    </div>
  );
}
