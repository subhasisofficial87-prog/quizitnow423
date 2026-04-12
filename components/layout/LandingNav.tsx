'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Globe, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation, type Lang } from '@/hooks/useTranslation';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'english', label: 'English' },
  { code: 'hindi', label: 'हिंदी' },
  { code: 'odia', label: 'ଓଡ଼ିଆ' },
];

export function LandingNav() {
  const { get, lang, changeLang } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-nunito font-extrabold text-xl text-blue-600 dark:text-blue-400">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span>QuizItNow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {LANGS.find((l) => l.code === lang)?.label ?? 'English'}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLang(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                        lang === l.code ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Login */}
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {get('auth.login', 'Login')}
            </Link>

            {/* Get Started */}
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              {get('nav.getStarted', 'Get Started Free')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setMenuOpen(false); }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                lang === l.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {l.label}
            </button>
          ))}
          <hr className="border-gray-100 dark:border-gray-800" />
          <Link href="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
            {get('auth.login', 'Login')}
          </Link>
          <Link href="/register" className="block w-full text-center px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl">
            {get('nav.getStarted', 'Get Started Free')}
          </Link>
        </div>
      )}
    </nav>
  );
}
