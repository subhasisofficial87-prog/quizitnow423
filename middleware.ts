import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/OdiaBoard/dashboard',
  '/OdiaBoard/study',
  '/CBSE/dashboard',
  '/CBSE/study',
  '/ICSE/dashboard',
  '/ICSE/study',
];

function verifyTokenBasic(token: string): boolean {
  // Basic JWT structure check — full verification happens in lib/auth server-side
  // Middleware uses a lightweight check to avoid importing Node.js crypto in Edge
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!payload || !payload.userId) return false;
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('qin_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const valid = verifyTokenBasic(token);
    if (!valid) throw new Error('Invalid token');
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('qin_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
