'use client';

import React from 'react';
import { DOCUMENT_TEMPLATES, DocumentTemplate } from '../../lib/templates';
import { Plus, FileText, Sparkles, Users, Code, ArrowRight } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
  isLoading?: boolean;
}

export function TemplateSelector({
  onSelectTemplate,
  isLoading = false,
}: TemplateSelectorProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-emerald-500" />;
      case 'Code':
        return <Code className="w-5 h-5 text-amber-500" />;
      default:
        return <Plus className="w-6 h-6 text-brand-600 dark:text-brand-400" />;
    }
  };

  return (
    <div className="bg-gray-100/70 dark:bg-[#141518] py-8 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Start a new document
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose a starter template or begin with a clean blank canvas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {DOCUMENT_TEMPLATES.map((tpl) => {
            const isBlank = tpl.id === 'blank';
            return (
              <button
                key={tpl.id}
                disabled={isLoading}
                onClick={() => onSelectTemplate(tpl)}
                className="group relative flex flex-col justify-between p-4 h-44 rounded-xl bg-white dark:bg-[#1c1d22] border border-gray-200 dark:border-gray-700/80 hover:border-brand-500 dark:hover:border-brand-400 shadow-sm hover:shadow-md transition-all text-left focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {tpl.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {tpl.badge}
                  </span>
                )}

                <div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                      isBlank
                        ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    {getIcon(tpl.icon)}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                  <span>Create draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
