'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { SEEDED_USERS } from '../../lib/seed-users';
import {
  FileText,
  Users,
  ChevronDown,
  UserCheck,
  Plus,
  Moon,
  Sun,
  Shield,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenUpload?: () => void;
  onCreateBlank?: () => void;
}

export function Navbar({ onOpenUpload, onCreateBlank }: NavbarProps) {
  const { currentUser, switchUserById, loginCustomUser, availableUsers } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showCustomLogin, setShowCustomLogin] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    await loginCustomUser(customEmail, customName);
    setCustomEmail('');
    setCustomName('');
    setShowCustomLogin(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#18191e] border-b border-gray-200 dark:border-[#2d3139] px-4 sm:px-6 py-2.5 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white tracking-tight text-lg">
                  Ajaia Docs
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                  v1.0 Pro
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
                Collaborative Document Workspace
              </p>
            </div>
          </Link>
        </div>

        {/* Right Section: Persona Switcher, Dark Mode, Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Persona Switcher (Crucial for Reviewers to test sharing flows effortlessly) */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all text-left group"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: currentUser.color || '#0e8fe5' }}
              >
                {currentUser.initials}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  {currentUser.name}
                  {currentUser.id === 'user_tooba' && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-medium px-1 rounded">
                      Candidate
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {currentUser.email}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors ml-0.5" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1f2025] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                    Switch Active Persona (Reviewer Demo)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Click any user to test document ownership &amp; permissions.
                  </p>
                </div>

                <div className="py-1 max-h-64 overflow-y-auto">
                  {availableUsers.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUserById(user.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors ${
                          isSelected
                            ? 'bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: user.color || '#0e8fe5' }}
                          >
                            {user.initials}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                              {user.name}
                              {user.id === 'user_tooba' && (
                                <span className="text-[9px] bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 px-1 rounded font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                              {user.role}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <UserCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom User Login */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-2.5">
                  {!showCustomLogin ? (
                    <button
                      onClick={() => setShowCustomLogin(true)}
                      className="w-full py-1.5 px-2 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Sign in as Custom Email
                    </button>
                  ) : (
                    <form onSubmit={handleCustomLogin} className="space-y-2 pt-1">
                      <input
                        type="email"
                        required
                        placeholder="collaborator@example.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <input
                        type="text"
                        placeholder="Display Name (optional)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-1 px-2 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                        >
                          Switch
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomLogin(false)}
                          className="py-1 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
