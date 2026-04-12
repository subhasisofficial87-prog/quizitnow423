import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import type { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; password?: string; fullName?: string; language?: string };
    const { email, password, fullName, language = 'english' } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check existing user
    const existing = await query<User[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    await query(
      'INSERT INTO users (email, password_hash, full_name, language, trial_start_date) VALUES (?, ?, ?, ?, NOW())',
      [email, passwordHash, fullName ?? null, language]
    );

    const newUser = await query<User[]>(
      'SELECT id, email, full_name, plan, plan_expires_at, trial_start_date, language, created_at FROM users WHERE email = ?',
      [email]
    );

    const user = newUser[0];
    const token = signToken({ userId: user.id, email: user.email, plan: user.plan });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
