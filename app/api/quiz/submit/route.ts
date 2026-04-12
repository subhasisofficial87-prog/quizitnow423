import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { scoreQuiz } from '@/lib/claude';
import type { DailySession, QuizQuestion } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      bookId?: number;
      dayNumber?: number;
      answers?: (string | number)[];
    };
    const { bookId, dayNumber, answers } = body;

    if (!bookId || !dayNumber || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessions = await query<DailySession[]>(
      'SELECT * FROM daily_sessions WHERE book_id = ? AND user_id = ? AND day_number = ?',
      [bookId, user.id, dayNumber]
    );

    if (sessions.length === 0 || !sessions[0].quiz_questions) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const session = sessions[0];
    const questions = session.quiz_questions as QuizQuestion[];
    const score = await scoreQuiz(questions, answers);

    await query(
      'UPDATE daily_sessions SET quiz_answers = ?, quiz_score = ?, completed = TRUE, completed_at = NOW() WHERE id = ?',
      [JSON.stringify(answers), score, session.id]
    );

    // Check for badges
    if (score === 100) {
      const existing = await query<{ id: number }[]>(
        'SELECT id FROM badges WHERE user_id = ? AND badge_type = ?',
        [user.id, 'perfect_score']
      );
      if (existing.length === 0) {
        await query('INSERT INTO badges (user_id, badge_type) VALUES (?, ?)', [user.id, 'perfect_score']);
      }
    }

    // First quiz badge
    const quizBadge = await query<{ id: number }[]>(
      'SELECT id FROM badges WHERE user_id = ? AND badge_type = ?',
      [user.id, 'first_quiz']
    );
    if (quizBadge.length === 0) {
      await query('INSERT INTO badges (user_id, badge_type) VALUES (?, ?)', [user.id, 'first_quiz']);
    }

    return NextResponse.json({ score });
  } catch (err) {
    console.error('Quiz submit error:', err);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
