import { NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/adminAuth';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const session = verifySessionCookie(cookieHeader);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, username: session.username });
}
