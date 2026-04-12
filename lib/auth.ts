import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { query } from './db';
import type { User } from '@/types';

const COOKIE_NAME = 'qin_token';
const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback_dev_secret_not_for_production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  plan: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAuthUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const rows = await query<User[]>(
      'SELECT id, email, full_name, plan, plan_expires_at, trial_start_date, language, created_at FROM users WHERE id = ?',
      [payload.userId]
    );

    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
