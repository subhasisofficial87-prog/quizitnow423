import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { generateLecture } from '@/lib/claude';
import { isInTrial } from '@/lib/utils';
import type { Book, DailySession, StudyPlan } from '@/types';

export const maxDuration = 120;

interface WeekDay {
  day: number;
  topic?: string;
  type?: string;
}
interface WeekData {
  days?: WeekDay[];
}
interface PlanData {
  weeks?: WeekData[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Trial/plan check
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

    // Verify book
    const books = await query<Book[]>(
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [bookId, user.id]
    );
    if (books.length === 0) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    const book = books[0];

    // Check cached lecture
    const sessions = await query<DailySession[]>(
      'SELECT * FROM daily_sessions WHERE book_id = ? AND user_id = ? AND day_number = ?',
      [bookId, user.id, dayNumber]
    );

    if (sessions.length > 0 && sessions[0].lecture_content) {
      return NextResponse.json({ lecture: sessions[0].lecture_content, topic: sessions[0].topic, cached: true });
    }

    // Get topic from study plan
    const plans = await query<StudyPlan[]>(
      'SELECT * FROM study_plans WHERE book_id = ? AND user_id = ? LIMIT 1',
      [bookId, user.id]
    );

    let topic = `Day ${dayNumber} Study Session`;
    if (plans.length > 0 && plans[0].plan_data) {
      const planData = plans[0].plan_data as unknown as PlanData;
      const weeks = planData?.weeks ?? [];
      for (const week of weeks) {
        for (const day of (week.days ?? [])) {
          if (day.day === dayNumber && day.topic) {
            topic = day.topic;
            break;
          }
        }
      }
    }

    // Generate lecture
    const lectureContent = await generateLecture(
      topic,
      book.extracted_text ?? '',
      dayNumber,
      book.class_level,
      book.board,
      user.language
    );

    // Cache in DB
    const today = new Date().toISOString().slice(0, 10);
    if (sessions.length > 0) {
      await query(
        'UPDATE daily_sessions SET lecture_content = ?, topic = ?, lecture_at = NOW() WHERE id = ?',
        [lectureContent, topic, sessions[0].id]
      );
    } else {
      await query(
        'INSERT INTO daily_sessions (book_id, user_id, day_number, session_date, topic, lecture_content, lecture_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [bookId, user.id, dayNumber, today, topic, lectureContent]
      );
    }

    return NextResponse.json({ lecture: lectureContent, topic });
  } catch (err) {
    console.error('Lecture error:', err);
    return NextResponse.json({ error: 'Failed to generate lecture' }, { status: 500 });
  }
}
