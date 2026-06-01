import { NextResponse } from 'next/server';
import { createSessionCookie, getAdminCredentials } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const { username: realUsername, password: realPassword } = getAdminCredentials();

    if (!realUsername || !realPassword) {
      console.error('[ADMIN LOGIN] ADMIN_USERNAME or ADMIN_PASSWORD is not configured in environment variables.');
      return NextResponse.json(
        { error: 'Admin authentication is not configured on the server.' },
        { status: 500 }
      );
    }

    // Constant-time comparison is not strictly needed for username/pass here since it's not a hash,
    // but we still do direct === after basic checks. For high security you would add rate limiting + logging.
    if (username === realUsername && password === realPassword) {
      const cookie = createSessionCookie(realUsername);
      const response = NextResponse.json({ ok: true, username: realUsername });
      response.headers.set('Set-Cookie', cookie);
      return response;
    }

    // Small delay to slow down brute force attempts slightly (defense in depth)
    await new Promise((r) => setTimeout(r, 250));

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (err) {
    console.error('[ADMIN LOGIN] Unexpected error:', err);
    return NextResponse.json({ error: 'Login failed due to server error' }, { status: 500 });
  }
}
