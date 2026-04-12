import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { generateQuiz } from '@/lib/claude';
import { isInTrial } from '@/lib/utils';
import type { Book, DailySession } from '@/types';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trialActive = isInTrial(user.trial_start_date);
    const planActive =
      user.plan !== 'free' &&
      user.plan_expires_at != null &&
      new Date(user.plan_expires_at) > new Date();

    if (!trialActive && !planActive) {
      return NextResponse.json({ error: 'trial_expired', trialExpired: true }, { status: 403 });
    }

    const body = await request.json() as { bookId?: number; dayNumber?: number };
    const { bookId, dayNumber } = body;

    if (!bookId || !dayNumber) {
      return NextResponse.json({ error: 'Missing bookId or dayNumber' }, { status: 400 });
    }

    const books = await query<Book[]>(
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [bookId, user.id]
    );
    if (books.length === 0) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    const book = books[0];

    // Check cached quiz
    const sessions = await query<DailySession[]>(
      'SELECT * FROM daily_sessions WHERE book_id = ? AND user_id = ? AND day_number = ?',
      [bookId, user.id, dayNumber]
    );

    if (sessions.length > 0 && sessions[0].quiz_questions) {
      return NextResponse.json({ questions: sessions[0].quiz_questions, topic: sessions[0].topic, cached: true });
    }

    const topic = sessions[0]?.topic ?? `Day ${dayNumber}`;

    // Generate quiz
    const questions = await generateQuiz(
      topic,
      book.extracted_text ?? '',
      dayNumber,
      book.class_level,
      user.language
    );

    // Cache
    const today = new Date().toISOString().slice(0, 10);
    if (sessions.length > 0) {
      await query(
        'UPDATE daily_sessions SET quiz_questions = ? WHERE id = ?',
        [JSON.stringify(questions), sessions[0].id]
      );
    } else {
      await query(
        'INSERT INTO daily_sessions (book_id, user_id, day_number, session_date, topic, quiz_questions) VALUES (?, ?, ?, ?, ?, ?)',
        [bookId, user.id, dayNumber, today, topic, JSON.stringify(questions)]
      );
    }

    return NextResponse.json({ questions, topic });
  } catch (err) {
    console.error('Quiz error:', err);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
