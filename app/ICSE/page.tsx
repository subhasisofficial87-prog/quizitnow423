'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { FileUploader } from '@/components/upload/FileUploader';
import type { User } from '@/types';

export default function ICSEPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d: { user?: User }) => { setUser(d.user ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <DashboardNav boardName="ICSE" boardHref="/ICSE" userName={user?.full_name} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg mb-4">
            <Sparkles className="w-4 h-4" />First 5 Days FREE!
          </div>
          <h1 className="font-nunito text-4xl font-extrabold text-gray-900 dark:text-white mb-3">🎓 ICSE Board</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Indian Certificate of Secondary Education — Comprehensive AI-powered learning in English
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <a href="/register?board=icse" className="underline font-semibold">Register free</a> or{' '}
                <a href="/login" className="underline font-semibold">login</a> to save your progress.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{ icon: '📖', label: 'ICSE Content' }, { icon: '📝', label: 'Detailed Quizzes' }, { icon: '💬', label: 'Doubt Sessions' }].map((f) => (
            <div key={f.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-green-100 dark:border-gray-700">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{f.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-green-500" />
            <h2 className="font-nunito text-xl font-bold text-gray-900 dark:text-white">Upload Your Book</h2>
          </div>
          <FileUploader board="icse" onUploadComplete={(bookId) => router.push(`/ICSE/study/${bookId}`)} />
        </div>

        {user && (
          <div className="text-center">
            <a href="/ICSE/dashboard" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-green-500 text-green-600 dark:text-green-400 font-bold rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
              View My Books →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
