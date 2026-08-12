'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../components/ui/Navbar';
import { TemplateSelector } from '../components/dashboard/TemplateSelector';
import { DocumentList } from '../components/dashboard/DocumentList';
import { ShareModal } from '../components/sharing/ShareModal';
import { FileUploadModal } from '../components/upload/FileUploadModal';
import { useAuth } from '../lib/auth-context';
import { DocumentListItem } from '../lib/types';
import { DocumentTemplate } from '../lib/templates';
import {
  FilePlus,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isLoading: authLoading } = useAuth();

  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'owned' | 'shared'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedShareDoc, setSelectedShareDoc] =
    useState<DocumentListItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type?: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch documents for the active persona
  const fetchDocuments = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setNetworkError(null);

    try {
      const queryParams = new URLSearchParams();
      if (activeFilter !== 'all') queryParams.set('filter', activeFilter);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

      const res = await fetch(`/api/documents?${queryParams.toString()}`, {
        headers: {
          'x-user-id': currentUser.id,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err: any) {
      console.error('Failed to load documents', err);
      setNetworkError(
        'Unable to connect to the backend server. Please make sure the server is running.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, activeFilter, searchQuery]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchDocuments();
    }
  }, [authLoading, currentUser, fetchDocuments]);

  // Create document from template or blank
  const handleSelectTemplate = async (template: DocumentTemplate) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          title: template.defaultTitle,
          content: template.content,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to create document', 'error');
        return;
      }

      const data = await res.json();
      if (data.document) {
        router.push(`/doc/${data.document.id}`);
      }
    } catch (err) {
      console.error('Error creating document', err);
      showToast('Network error: Failed to connect to server', 'error');
    }
  };

  const handleCreateBlank = () => {
    handleSelectTemplate({
      id: 'blank',
      name: 'Blank Document',
      description: 'Start from scratch',
      icon: 'FileText',
      defaultTitle: 'Untitled document',
      content: '<p></p>',
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this document? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id },
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        showToast('Document deleted successfully', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to delete document', 'error');
      }
    } catch (err) {
      console.error('Error deleting document', err);
      showToast('Network error: Unable to delete document', 'error');
    }
  };

  const handleRename = async (doc: DocumentListItem) => {
    const newTitle = window.prompt('Enter new document title:', doc.title);
    if (!newTitle || newTitle.trim() === doc.title) return;

    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (res.ok) {
        fetchDocuments();
        showToast('Document title updated', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to rename document', 'error');
      }
    } catch (err) {
      console.error('Error renaming document', err);
      showToast('Network error: Unable to update title', 'error');
    }
  };

  const handleDuplicate = async (doc: DocumentListItem) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          title: `Copy of ${doc.title}`,
          content: doc.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Created copy: "${data.document.title}"`, 'success');
        fetchDocuments();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to copy document', 'error');
      }
    } catch (err) {
      console.error('Error duplicating document', err);
      showToast('Network error: Unable to duplicate document', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-docbg-canvas dark:bg-docbg-canvasDark transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onCreateBlank={handleCreateBlank}
      />

      {/* Network Alert Banner */}
      {networkError && (
        <div className="bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800 px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-red-800 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{networkError}</span>
          </div>
          <button
            onClick={fetchDocuments}
            className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-red-900/60 border border-red-300 dark:border-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Hero Template Selector */}
      <TemplateSelector
        onSelectTemplate={handleSelectTemplate}
        isLoading={isLoading}
      />

      {/* Main Document List */}
      <main className="flex-1">
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          onShare={(doc) => setSelectedShareDoc(doc)}
          onDelete={handleDelete}
          onRename={handleRename}
          onDuplicate={handleDuplicate}
          onOpenUpload={() => setIsUploadOpen(true)}
          onCreateBlank={handleCreateBlank}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </main>

      {/* Share Modal */}
      {selectedShareDoc && (
        <ShareModal
          document={selectedShareDoc}
          isOpen={!!selectedShareDoc}
          onClose={() => setSelectedShareDoc(null)}
          onShareUpdated={fetchDocuments}
        />
      )}

      {/* File Upload / Ingest Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentCreated={(newDocId) => {
          fetchDocuments();
          router.push(`/doc/${newDocId}`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-red-600 text-white shadow-red-500/20'
              : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
