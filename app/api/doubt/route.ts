import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { doubtChat } from '@/lib/claude';
import type { Book, DoubtMessage } from '@/types';

export const maxDuration = 120;

interface DoubtSession {
  id: number;
  messages: DoubtMessage[] | null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Pro plan only
    const planActive =
      user.plan === 'pro' &&
      user.plan_expires_at != null &&
      new Date(user.plan_expires_at) > new Date();

    if (!planActive) {
      return NextResponse.json(
        { error: 'Doubt clearing is available for Pro plan subscribers only.' },
        { status: 403 }
      );
    }

    const body = await request.json() as {
      bookId?: number;
      weekNumber?: number;
      question?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };
    const { bookId, weekNumber, question, history = [] } = body;

    if (!bookId || !weekNumber || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const books = await query<Book[]>(
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [bookId, user.id]
    );
    if (books.length === 0) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    const book = books[0];

    const answer = await doubtChat(
      question,
      book.extracted_text ?? '',
      history,
      book.class_level,
      user.language
    );

    // Save conversation
    const sessions = await query<DoubtSession[]>(
      'SELECT * FROM doubt_sessions WHERE book_id = ? AND user_id = ? AND week_number = ?',
      [bookId, user.id, weekNumber]
    );

    const userMsg: DoubtMessage = { role: 'user', content: question, timestamp: new Date().toISOString() };
    const aiMsg: DoubtMessage = { role: 'assistant', content: answer, timestamp: new Date().toISOString() };

    if (sessions.length > 0) {
      const existingMsgs: DoubtMessage[] = sessions[0].messages ?? [];
      const updatedMsgs = [...existingMsgs, userMsg, aiMsg];
      await query(
        'UPDATE doubt_sessions SET messages = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(updatedMsgs), sessions[0].id]
      );
    } else {
      await query(
        'INSERT INTO doubt_sessions (book_id, user_id, week_number, messages) VALUES (?, ?, ?, ?)',
        [bookId, user.id, weekNumber, JSON.stringify([userMsg, aiMsg])]
      );
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('Doubt error:', err);
    return NextResponse.json({ error: 'Failed to process doubt' }, { status: 500 });
  }
}
