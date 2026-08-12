'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

import { EditorToolbar } from './EditorToolbar';
import { extractPlainText } from '../../lib/file-parsers';
import { Lock, Eye, Users, FileText, Sparkles } from 'lucide-react';

interface EditorCanvasProps {
  initialContent: string;
  readOnly?: boolean;
  onContentChange: (html: string) => void;
  onEditorReady?: (editor: any) => void;
}

export function EditorCanvas({
  initialContent,
  readOnly = false,
  onContentChange,
  onEditorReady,
}: EditorCanvasProps) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document here or paste content...',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-600 dark:text-brand-400 underline cursor-pointer',
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (readOnly) return;
      const html = editor.getHTML();
      const text = extractPlainText(html);

      // Calculate stats
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      setReadingTime(Math.max(1, Math.ceil(words / 200)));

      // Debounce auto-save to parent (800ms)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onContentChange(html);
      }, 800);
    },
  });

  // Keep editor editable status synchronized with readOnly prop
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }
  }, [editor, readOnly, onEditorReady]);

  // Update initial content when document changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      // Only set if substantially different to avoid cursor jumps
      const current = editor.getHTML();
      if (Math.abs(current.length - initialContent.length) > 5) {
        editor.commands.setContent(initialContent);
        const text = extractPlainText(initialContent);
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);
        setCharCount(text.length);
      }
    }
  }, [initialContent, editor]);

  // Initial stats calculation
  useEffect(() => {
    if (initialContent) {
      const text = extractPlainText(initialContent);
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      setReadingTime(Math.max(1, Math.ceil(words / 200)));
    }
  }, [initialContent]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-docbg-canvas dark:bg-docbg-canvasDark">
      {/* Rich Formatting Toolbar */}
      <EditorToolbar editor={editor} readOnly={readOnly} />

      {/* Read-Only Notice Banner */}
      {readOnly && (
        <div className="no-print bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900 px-6 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>
            You have <strong>View-Only</strong> access to this document. Changes will not be saved.
          </span>
        </div>
      )}

      {/* Google Docs Canvas Area */}
      <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 overflow-y-auto flex justify-center">
        <div
          className="print-page w-full max-w-[850px] min-h-[1050px] bg-white dark:bg-[#1c1d22] rounded-lg shadow-paper sm:shadow-paper-lg border border-gray-200/80 dark:border-gray-800 px-8 sm:px-16 py-12 sm:py-16 transition-colors"
          style={{
            minHeight: '1050px',
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Floating Bottom Stats Bar */}
      <div className="no-print sticky bottom-0 bg-white/90 dark:bg-[#18191e]/90 backdrop-blur-xs border-t border-gray-200 dark:border-[#2d3139] px-6 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 z-10 shadow-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>{wordCount} words</span>
          </span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span>{charCount} characters</span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span>~{readingTime} min read</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium text-gray-600 dark:text-gray-300">
            A4 Page View • 100% Zoom
          </span>
        </div>
      </div>
    </div>
  );
}
