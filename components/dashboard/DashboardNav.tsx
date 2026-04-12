'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronDown, Globe, LogOut, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation, type Lang } from '@/hooks/useTranslation';

interface DashboardNavProps {
  boardName: string;
  boardHref: string;
  userName?: string | null;
}

const LANGS: { code: Lang; label: string }[] = [
  { code: 'english', label: 'EN' },
  { code: 'hindi', label: 'हि' },
  { code: 'odia', label: 'ଓ' },
];

export function DashboardNav({ boardName, boardHref, userName }: DashboardNavProps) {
  const { lang, changeLang } = useTranslation();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Board */}
          <Link href={boardHref} className="flex items-center gap-2 font-nunito font-extrabold text-blue-600 dark:text-blue-400">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm sm:text-base">QuizItNow</span>
            <span className="hidden sm:inline text-gray-400 dark:text-gray-600">|</span>
            <span className="hidden sm:inline text-sm font-semibold text-gray-700 dark:text-gray-300">{boardName}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <Globe className="w-3.5 h-3.5" />
                {LANGS.find((l) => l.code === lang)?.label ?? 'EN'}
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLang(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                        lang === l.code ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {l.code === 'english' ? 'English' : l.code === 'hindi' ? 'हिंदी' : 'ଓଡ଼ିଆ'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                  {userName ?? 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName ?? 'User'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
