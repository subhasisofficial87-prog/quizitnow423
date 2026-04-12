'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { FileUploader } from '@/components/upload/FileUploader';
import type { User } from '@/types';

export default function OdiaBoardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d: { user?: User }) => {
        setUser(d.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUploadComplete = (bookId: number) => {
    router.push(`/OdiaBoard/study/${bookId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <DashboardNav boardName="Odia Board" boardHref="/OdiaBoard" userName={user?.full_name} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg mb-4">
            <Sparkles className="w-4 h-4" />
            First 5 Days FREE!
          </div>
          <h1 className="font-nunito text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            🏛️ Odia Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            BSE Odisha curriculum with AI-powered personalized learning in Odia, Hindi & English
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> You need an account to save your progress.{' '}
                <a href="/register?board=odia_board" className="underline font-semibold">Register free</a> or{' '}
                <a href="/login" className="underline font-semibold">login</a>.
              </p>
            </div>
          )}
        </div>

        {/* Features Banner */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '📖', label: 'Daily Lectures' },
            { icon: '📝', label: 'Smart Quizzes' },
            { icon: '💬', label: 'Doubt Clearing' },
          ].map((f) => (
            <div key={f.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-orange-100 dark:border-gray-700">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{f.label}</div>
            </div>
          ))}
        </div>

        {/* File Uploader */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="font-nunito text-xl font-bold text-gray-900 dark:text-white">Upload Your Book</h2>
          </div>
          <FileUploader board="odia_board" onUploadComplete={handleUploadComplete} />
        </div>

        {/* Go to Dashboard */}
        {user && (
          <div className="text-center">
            <a
              href="/OdiaBoard/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-orange-500 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              View My Books →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
