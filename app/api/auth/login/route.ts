import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import type { User } from '@/types';

interface DBUser extends User {
  password_hash: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const rows = await query<DBUser[]>(
      'SELECT id, email, password_hash, full_name, plan, plan_expires_at, trial_start_date, language, created_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const dbUser = rows[0];
    const valid = await verifyPassword(password, dbUser.password_hash);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ userId: dbUser.id, email: dbUser.email, plan: dbUser.plan });

    const { password_hash: _pw, ...user } = dbUser;
    void _pw;

    const response = NextResponse.json({ user });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
