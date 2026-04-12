'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Loader2, AlertCircle, PenLine } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { LectureView } from '@/components/study/LectureView';
import type { User, Book } from '@/types';

export default function CBSELecturePage() {
  const router = useRouter();
  const params = useParams();
  const bookId = parseInt(params.bookId as string);
  const day = parseInt(params.day as string);

  const [user, setUser] = useState<User | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [lecture, setLecture] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json() as { user?: User };
        if (!meData.user) { router.push('/login'); return; }
        setUser(meData.user);

        const booksRes = await fetch('/api/books');
        const booksData = await booksRes.json() as { books?: Book[] };
        setBook((booksData.books ?? []).find((b) => b.id === bookId) ?? null);

        const lectureRes = await fetch('/api/lecture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, dayNumber: day }),
        });

        if (lectureRes.status === 403) { setTrialExpired(true); setLoading(false); return; }
        const lectureData = await lectureRes.json() as { lecture?: string; topic?: string; error?: string };
        if (!lectureRes.ok) throw new Error(lectureData.error ?? 'Failed');
        setLecture(lectureData.lecture ?? '');
        setTopic(lectureData.topic ?? `Day ${day}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lecture');
      }
      setLoading(false);
    };
    fetchData();
  }, [bookId, day, router]);

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /><p className="font-nunito text-lg font-bold text-gray-900 dark:text-white">Generating your lecture...</p></div>;

  if (trialExpired) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center shadow-xl">
        <div className="text-5xl mb-4">⏰</div>
        <h2 className="font-nunito text-2xl font-bold text-gray-900 dark:text-white mb-2">Trial Ended</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Upgrade to continue learning!</p>
        <a href="/#pricing" className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Upgrade Now</a>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center shadow-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav boardName="CBSE" boardHref="/CBSE" userName={user?.full_name} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push(`/CBSE/study/${bookId}`)} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" />Back to Study
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{book?.title ?? 'Book'}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
          <LectureView content={lecture} topic={topic} dayNumber={day} classLevel={book?.class_level ?? '1'} />
        </div>
        <div className="flex items-center justify-between gap-4">
          {day > 1 && (
            <button onClick={() => router.push(`/CBSE/study/${bookId}/lecture/${day - 1}`)} className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4" />Day {day - 1}
            </button>
          )}
          <button onClick={() => router.push(`/CBSE/study/${bookId}/quiz/${day}`)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-md">
            <PenLine className="w-5 h-5" />Take Quiz<ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
