import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'change-this-in-production-very-long-random-string';

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get('admin-session')?.value;
  
  if (!token) return false;

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
