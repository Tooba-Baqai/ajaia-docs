'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Palette,
  Undo2,
  Redo2,
  RemoveFormatting,
  ChevronDown,
  Lock,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export function EditorToolbar({ editor, readOnly = false }: EditorToolbarProps) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);

  if (!editor) return null;

  const handleAddImage = () => {
    if (readOnly) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSetLink = () => {
    if (readOnly) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter web URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };

  const colors = [
    { label: 'Default', value: 'inherit' },
    { label: 'Dark Gray', value: '#374151' },
    { label: 'Blue', value: '#2563eb' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Amber', value: '#d97706' },
    { label: 'Rose', value: '#e11d48' },
    { label: 'Purple', value: '#7c3aed' },
  ];

  const highlights = [
    { label: 'None', value: '' },
    { label: 'Yellow', value: '#fef08a' },
    { label: 'Green', value: '#bbf7d0' },
    { label: 'Blue', value: '#bfdbfe' },
    { label: 'Pink', value: '#fbcfe8' },
    { label: 'Purple', value: '#e9d5ff' },
  ];

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal text';
  };

  return (
    <div className="no-print bg-white dark:bg-[#18191e] border-b border-gray-200 dark:border-[#2d3139] px-4 py-1.5 flex items-center gap-1 flex-wrap sticky top-[57px] z-20 shadow-xs transition-colors">
      {readOnly ? (
        <div className="flex items-center gap-2 py-1 px-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-lg w-full">
          <Lock className="w-3.5 h-3.5" />
          <span>
            You are viewing this document in read-only mode. Toolbar controls are disabled.
          </span>
        </div>
      ) : (
        <>
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200 dark:border-gray-700">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-35 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-35 transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Heading Style Dropdown */}
          <div className="relative pr-1 border-r border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowHeadingMenu(!showHeadingMenu)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span>{getCurrentHeading()}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showHeadingMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowHeadingMenu(false)}
                />
                <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-[#1f2025] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      editor.chain().focus().setParagraph().run();
                      setShowHeadingMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${
                      !editor.isActive('heading')
                        ? 'text-brand-600 dark:text-brand-400 font-bold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>Normal text</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 1 }).run();
                      setShowHeadingMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-sm text-left font-bold hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      editor.isActive('heading', { level: 1 })
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    Heading 1
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                      setShowHeadingMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      editor.isActive('heading', { level: 2 })
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    Heading 2
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 3 }).run();
                      setShowHeadingMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      editor.isActive('heading', { level: 3 })
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Heading 3
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Character Formatting: Bold, Italic, Underline, Strikethrough */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200 dark:border-gray-700">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('bold')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('italic')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl+U)"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('underline')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('strike')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Color & Highlight */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200 dark:border-gray-700 relative">
            {/* Text Color */}
            <button
              onClick={() => setShowColorMenu(!showColorMenu)}
              title="Text Color"
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-0.5"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowColorMenu(false)}
                />
                <div className="absolute left-0 mt-8 w-36 bg-white dark:bg-[#1f2025] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-40 grid grid-cols-4 gap-1.5">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        if (c.value === 'inherit') {
                          editor.chain().focus().unsetColor().run();
                        } else {
                          editor.chain().focus().setColor(c.value).run();
                        }
                        setShowColorMenu(false);
                      }}
                      title={c.label}
                      className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.value === 'inherit' ? '#000' : c.value }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Text Highlight */}
            <button
              onClick={() => setShowHighlightMenu(!showHighlightMenu)}
              title="Highlight Color"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('highlight')
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Highlighter className="w-4 h-4" />
            </button>
            {showHighlightMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowHighlightMenu(false)}
                />
                <div className="absolute left-6 mt-8 w-36 bg-white dark:bg-[#1f2025] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-40 grid grid-cols-3 gap-1.5">
                  {highlights.map((h) => (
                    <button
                      key={h.label}
                      onClick={() => {
                        if (!h.value) {
                          editor.chain().focus().unsetHighlight().run();
                        } else {
                          editor.chain().focus().toggleHighlight({ color: h.value }).run();
                        }
                        setShowHighlightMenu(false);
                      }}
                      title={h.label}
                      className="w-8 h-6 rounded border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                      style={{ backgroundColor: h.value || '#fff' }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Alignment: Left, Center, Right, Justify */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200 dark:border-gray-700">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title="Align Left"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive({ textAlign: 'left' })
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              title="Align Center"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive({ textAlign: 'center' })
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title="Align Right"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive({ textAlign: 'right' })
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              title="Justify"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive({ textAlign: 'justify' })
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Lists: Bullet, Numbered, Checklist */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200 dark:border-gray-700">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bulleted List"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('bulletList')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('orderedList')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              title="Task Checklist"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('taskList')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <ListTodo className="w-4 h-4" />
            </button>
          </div>

          {/* Blocks: Blockquote, Code Block, Horizontal Rule, Link, Image */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('blockquote')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('codeBlock')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Divider"
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleSetLink}
              title="Insert Link"
              className={`p-1.5 rounded-md transition-colors ${
                editor.isActive('link')
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddImage}
              title="Insert Image"
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              title="Clear Formatting"
              className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
