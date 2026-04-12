'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { ProgressCalendar } from '@/components/dashboard/ProgressCalendar';
import { BadgeDisplay } from '@/components/dashboard/BadgeDisplay';
import { classDisplayName, formatDate } from '@/lib/utils';
import type { User, Book, DailySession, Badge } from '@/types';

export default function CBSEDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [sessions, setSessions] = useState<DailySession[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, booksRes, progressRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/books?board=cbse'),
          fetch('/api/progress'),
        ]);
        const meData = await meRes.json() as { user?: User };
        const booksData = await booksRes.json() as { books?: Book[] };
        const progressData = await progressRes.json() as { sessions?: DailySession[]; badges?: Badge[]; streak?: number };

        if (!meData.user) { router.push('/login'); return; }
        setUser(meData.user);
        setBooks(booksData.books ?? []);
        setSessions(progressData.sessions ?? []);
        setBadges(progressData.badges ?? []);
        setStreak(progressData.streak ?? 0);
      } catch { router.push('/login'); }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const statusIcon = (status: Book['processing_status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav boardName="CBSE" boardHref="/CBSE" userName={user?.full_name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name?.split(' ')[0] ?? 'Student'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Your CBSE dashboard</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Books', value: books.length, color: 'text-blue-600' },
            { label: 'Day Streak', value: `${streak} 🔥`, color: 'text-red-500' },
            { label: 'Sessions Done', value: sessions.filter((s) => s.completed).length, color: 'text-green-600' },
            { label: 'Plan', value: user?.plan === 'free' ? 'Free Trial' : user?.plan ?? 'Free', color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className={`font-nunito text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-nunito text-xl font-bold text-gray-900 dark:text-white">My Books</h2>
              <a href="/CBSE" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md">
                <Plus className="w-4 h-4" />Add Book
              </a>
            </div>
            {books.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No books yet. Upload your first textbook!</p>
                <a href="/CBSE" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                  <Plus className="w-4 h-4" />Upload Book
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => book.processing_status === 'completed' && router.push(`/CBSE/study/${book.id}`)}
                    className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md ${book.processing_status === 'completed' ? 'cursor-pointer hover:-translate-y-0.5' : 'opacity-80'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{book.title ?? 'Untitled Book'}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {statusIcon(book.processing_status)}
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{book.processing_status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">{classDisplayName(book.class_level)}</span>
                          <span>{formatDate(book.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <ProgressCalendar sessions={sessions} />
            <BadgeDisplay badges={badges} />
          </div>
        </div>
      </div>
    </div>
  );
}
