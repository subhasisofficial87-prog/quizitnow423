'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { QuizView } from '@/components/study/QuizView';
import type { User, Book, QuizQuestion } from '@/types';

export default function ICSEQuizPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = parseInt(params.bookId as string);
  const day = parseInt(params.day as string);

  const [user, setUser] = useState<User | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
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

        const quizRes = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, dayNumber: day }),
        });

        if (quizRes.status === 403) { setTrialExpired(true); setLoading(false); return; }
        const quizData = await quizRes.json() as { questions?: QuizQuestion[]; topic?: string; error?: string };
        if (!quizRes.ok) throw new Error(quizData.error ?? 'Failed');
        setQuestions(quizData.questions ?? []);
        setTopic(quizData.topic ?? `Day ${day}`);
      } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
      setLoading(false);
    };
    fetchData();
  }, [bookId, day, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-green-500" /></div>;

  if (trialExpired) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center shadow-xl">
        <div className="text-5xl mb-4">⏰</div>
        <h2 className="font-nunito text-2xl font-bold text-gray-900 dark:text-white mb-2">Trial Ended</h2>
        <a href="/#pricing" className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-4">Upgrade Now</a>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center shadow-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav boardName="ICSE" boardHref="/ICSE" userName={user?.full_name} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push(`/ICSE/study/${bookId}/lecture/${day}`)} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />Back to Lecture
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{book?.title ?? 'Book'}</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-5 text-white mb-6 shadow-lg">
          <div className="text-xs font-bold opacity-80 mb-1">Day {day} Quiz</div>
          <h1 className="font-nunito text-xl font-extrabold">{topic}</h1>
          <p className="text-sm text-green-100 mt-1">{questions.length} questions</p>
        </div>
        <QuizView questions={questions} dayNumber={day} bookId={bookId} classLevel={book?.class_level ?? '1'} onComplete={(s) => console.log('score', s)} />
      </div>
    </div>
  );
}
