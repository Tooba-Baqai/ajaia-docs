'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent?: (html: string, title?: string) => void;
  currentDocId?: string;
  onDocumentCreated?: (docId: string) => void;
}

export function FileUploadModal({
  isOpen,
  onClose,
  onInsertContent,
  currentDocId,
  onDocumentCreated,
}: FileUploadModalProps) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{
    title: string;
    htmlContent: string;
    plainText: string;
    format: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', 'parse_only');

      const res = await fetch('/api/documents/import', {
        method: 'POST',
        headers: {
          'x-user-id': currentUser.id,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setParsedPreview(data.parsed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing uploaded file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewDoc = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', 'create_doc');

      const res = await fetch('/api/documents/import', {
        method: 'POST',
        headers: {
          'x-user-id': currentUser.id,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create document from file');
      }

      onClose();
      if (onDocumentCreated) {
        onDocumentCreated(data.document.id);
      } else {
        router.push(`/doc/${data.document.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create document');
      setIsProcessing(false);
    }
  };

  const handleInsertIntoCurrent = () => {
    if (!parsedPreview || !onInsertContent) return;
    onInsertContent(parsedPreview.htmlContent, parsedPreview.title);
    onClose();
  };

  const getFormatIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'docx')
      return <FileText className="w-8 h-8 text-blue-500" />;
    if (ext === 'md' || ext === 'markdown')
      return <FileCode className="w-8 h-8 text-purple-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#1c1d22] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Import &amp; Upload Document
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Convert Word (.docx), Markdown (.md), or text (.txt) into editable rich-text
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.md,.markdown,.txt,.html"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            /* Drag & Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragOver
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[1.01]'
                  : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 bg-gray-50/50 dark:bg-gray-800/40'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-300 shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Click to browse or drag and drop files here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supported formats: Microsoft Word (.docx), Markdown (.md), Plain Text (.txt), HTML
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  DOCX
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                  MARKDOWN
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  PLAIN TEXT
                </span>
              </div>
            </div>
          ) : (
            /* Selected File Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {getFormatIcon(selectedFile.name)}
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                      {parsedPreview?.format.toUpperCase() || 'Parsing...'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setParsedPreview(null);
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline"
                >
                  Change file
                </button>
              </div>

              {/* Parsed Snippet Preview */}
              {parsedPreview && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Content Preview
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready to ingest
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-4 font-mono bg-white dark:bg-[#121316] p-2 rounded-lg border border-gray-200 dark:border-gray-800">
                    {parsedPreview.plainText.slice(0, 300) || '(Empty document)'}
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>

          {selectedFile && (
            <>
              {currentDocId && onInsertContent && (
                <button
                  onClick={handleInsertIntoCurrent}
                  disabled={isProcessing || !parsedPreview}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  Insert into Current Doc
                </button>
              )}

              <button
                onClick={handleCreateNewDoc}
                disabled={isProcessing || !parsedPreview}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                <span>Create as New Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
