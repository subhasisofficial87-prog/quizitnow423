'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, Calendar, MessageCircle, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { ProgressCalendar } from '@/components/dashboard/ProgressCalendar';
import { BadgeDisplay } from '@/components/dashboard/BadgeDisplay';
import { DoubtChat } from '@/components/doubt/DoubtChat';
import { isWeekend, getCurrentDayNumber, classDisplayName } from '@/lib/utils';
import type { User, Book, StudyPlan, DailySession, Badge } from '@/types';

export default function StudyOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = parseInt(params.bookId as string);

  const [user, setUser] = useState<User | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [sessions, setSessions] = useState<DailySession[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, progressRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch(`/api/progress?bookId=${bookId}`),
        ]);
        const meData = await meRes.json() as { user?: User };
        const progressData = await progressRes.json() as { sessions?: DailySession[]; badges?: Badge[] };

        if (!meData.user) { router.push('/login'); return; }
        setUser(meData.user);
        setSessions(progressData.sessions ?? []);
        setBadges(progressData.badges ?? []);

        // Fetch book
        const booksRes = await fetch('/api/books');
        const booksData = await booksRes.json() as { books?: Book[] };
        const foundBook = (booksData.books ?? []).find((b) => b.id === bookId);
        if (foundBook) setBook(foundBook);
      } catch {
        router.push('/login');
      }
      setLoading(false);
    };
    fetchData();
  }, [bookId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  const today = new Date();
  const isWeekendToday = isWeekend(today);
  const dayNumber = plan ? getCurrentDayNumber(plan.start_date) : 1;
  const weekNumber = Math.ceil(dayNumber / 7);
  const isPro = user?.plan === 'pro' && !!user.plan_expires_at && new Date(user.plan_expires_at) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav boardName="Odia Board" boardHref="/OdiaBoard" userName={user?.full_name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Book Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-nunito text-2xl font-extrabold mb-1">{book?.title ?? 'My Book'}</h1>
              <div className="flex items-center gap-3 text-orange-100 text-sm">
                <span>{classDisplayName(book?.class_level ?? '1')}</span>
                <span>•</span>
                <span>Odia Board</span>
                <span>•</span>
                <span className="capitalize">{book?.processing_status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Action */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h2 className="font-nunito text-lg font-bold text-gray-900 dark:text-white">Today&apos;s Schedule</h2>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          {isWeekendToday ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-nunito text-xl font-bold text-gray-900 dark:text-white">Weekend!</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Great work this week! Use today for revision or doubt clearing.</p>
              {isPro ? (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">💬 Doubt clearing available below</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Upgrade to Pro for weekend doubt sessions</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push(`/OdiaBoard/study/${bookId}/lecture/${dayNumber}`)}
                className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">Day {dayNumber} Lecture</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Start learning</div>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500 ml-auto group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push(`/OdiaBoard/study/${bookId}/quiz/${dayNumber}`)}
                className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">Day {dayNumber} Quiz</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Test yourself</div>
                </div>
                <ArrowRight className="w-4 h-4 text-green-500 ml-auto group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProgressCalendar sessions={sessions} />
            {/* Doubt Chat */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <h2 className="font-nunito text-lg font-bold text-gray-900 dark:text-white">Doubt Clearing</h2>
              </div>
              <DoubtChat
                bookId={bookId}
                weekNumber={weekNumber}
                isPro={isPro}
              />
            </div>
          </div>
          <BadgeDisplay badges={badges} />
        </div>
      </div>
    </div>
  );
}
