import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { extractAndPlan } from '@/lib/claude';
import type { Book } from '@/types';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      bookId?: number;
      fileType?: 'pdf' | 'images';
      base64Pdf?: string;
      images?: string[];
      classLevel?: string;
      board?: string;
    };

    const { bookId, fileType, base64Pdf, images, classLevel, board } = body;

    if (!bookId || !fileType || !classLevel || !board) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify book belongs to user
    const books = await query<Book[]>(
      'SELECT * FROM books WHERE id = ? AND user_id = ?',
      [bookId, user.id]
    );
    if (books.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Mark as processing
    await query('UPDATE books SET processing_status = ? WHERE id = ?', ['processing', bookId]);

    try {
      const boardType = board as 'odia_board' | 'cbse' | 'icse';
      const result = await extractAndPlan(fileType, classLevel, boardType, base64Pdf, images);

      // Update book with extracted text
      await query(
        'UPDATE books SET extracted_text = ?, processing_status = ? WHERE id = ?',
        [result.extractedText, 'completed', bookId]
      );

      // Create study plan
      const today = new Date().toISOString().slice(0, 10);
      await query(
        'INSERT INTO study_plans (book_id, user_id, total_days, start_date, syllabus_topics, plan_data) VALUES (?, ?, ?, ?, ?, ?)',
        [
          bookId,
          user.id,
          200,
          today,
          JSON.stringify(result.syllabusTopics),
          JSON.stringify(result.studyPlan),
        ]
      );

      return NextResponse.json({ success: true, bookId });
    } catch (aiError) {
      await query(
        'UPDATE books SET processing_status = ?, error_message = ? WHERE id = ?',
        ['failed', aiError instanceof Error ? aiError.message : 'AI processing failed', bookId]
      );
      throw aiError;
    }
  } catch (err) {
    console.error('Process error:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
