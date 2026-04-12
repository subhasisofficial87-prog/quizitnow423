'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function Footer() {
  const { get } = useTranslation();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-2 font-nunito font-extrabold text-xl text-white mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              QuizItNow
            </div>
            <p className="text-sm text-gray-500">
              AI-powered learning for every Indian student.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/#boards" className="hover:text-white transition-colors">Boards</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Boards */}
          <div>
            <h4 className="text-white font-semibold mb-3">Boards</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/OdiaBoard" className="hover:text-white transition-colors">Odia Board</Link></li>
              <li><Link href="/CBSE" className="hover:text-white transition-colors">CBSE</Link></li>
              <li><Link href="/ICSE" className="hover:text-white transition-colors">ICSE</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>{get('footer.copyright', '© 2025 QuizItNow. All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
}
