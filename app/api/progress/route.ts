import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import type { DailySession, Badge } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    let sessions: DailySession[];
    if (bookId) {
      sessions = await query<DailySession[]>(
        'SELECT * FROM daily_sessions WHERE book_id = ? AND user_id = ? ORDER BY day_number ASC',
        [bookId, user.id]
      );
    } else {
      sessions = await query<DailySession[]>(
        'SELECT * FROM daily_sessions WHERE user_id = ? ORDER BY session_date DESC LIMIT 100',
        [user.id]
      );
    }

    const badges = await query<Badge[]>(
      'SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC',
      [user.id]
    );

    // Calculate streak
    const completedDates = sessions
      .filter((s) => s.completed)
      .map((s) => s.session_date)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    let currentDate = today;

    for (const date of completedDates) {
      if (date === currentDate) {
        streak++;
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        currentDate = d.toISOString().slice(0, 10);
      } else {
        break;
      }
    }

    return NextResponse.json({ sessions, badges, streak });
  } catch (err) {
    console.error('Progress error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
