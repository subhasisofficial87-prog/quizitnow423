import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { language?: string };
    const { language } = body;

    if (!language || !['english', 'hindi', 'odia'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    await query('UPDATE users SET language = ? WHERE id = ?', [language, user.id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Language update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
