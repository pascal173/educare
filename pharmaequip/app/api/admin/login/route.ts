import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'change-this-in-production-very-long-random-string';

function createSessionToken(username: string): string {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}:${signature}`;
}

function verifySessionToken(token: string): boolean {
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  
  const [username, timestamp, signature] = parts;
  const payload = `${username}:${timestamp}`;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = createSessionToken(username);
      
      const response = NextResponse.json({ success: true });
      
      // Set httpOnly cookie (secure in production)
      response.cookies.set('admin-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
