import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Book } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board');

    let books: Book[];
    if (board) {
      books = await query<Book[]>(
        'SELECT * FROM books WHERE user_id = ? AND board = ? ORDER BY created_at DESC',
        [user.id, board]
      );
    } else {
      books = await query<Book[]>(
        'SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC',
        [user.id]
      );
    }

    return NextResponse.json({ books });
  } catch (err) {
    console.error('Books GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      board?: string;
      classLevel?: string;
      title?: string;
      fileType?: string;
      originalFilename?: string;
    };
    const { board, classLevel, title, fileType, originalFilename } = body;

    if (!board || !classLevel || !fileType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query<{ insertId: number }>(
      'INSERT INTO books (user_id, board, class_level, title, original_filename, file_type, processing_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.id, board, classLevel, title ?? null, originalFilename ?? null, fileType, 'pending']
    );

    return NextResponse.json({ bookId: result.insertId }, { status: 201 });
  } catch (err) {
    console.error('Books POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
