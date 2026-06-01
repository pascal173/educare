import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

interface SessionPayload {
  u: string; // username
  exp: number; // expiration timestamp (ms)
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    // In production this will cause login to fail with clear error
    throw new Error('ADMIN_SESSION_SECRET env var is missing or too short (min 16 chars recommended)');
  }
  return secret;
}

function sign(data: string): string {
  const hmac = createHmac('sha256', getSessionSecret());
  hmac.update(data);
  return hmac.digest('hex');
}

export function createSessionCookie(username: string): string {
  const exp = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
  const payload: SessionPayload = { u: username, exp };
  const json = JSON.stringify(payload);
  // base64url is safe for cookies (no = + / padding issues)
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const signature = sign(b64);
  const value = `${b64}.${signature}`;

  const isProd = process.env.NODE_ENV === 'production';
  // HttpOnly + Secure (in prod) + SameSite=Lax is the secure default
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
  ];
  if (isProd) parts.push('Secure');

  return parts.join('; ');
}

export function clearSessionCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Returns the username if the cookie is present, valid signature, and not expired.
 */
export function verifySessionCookie(cookieHeader: string | null | undefined): { username: string } | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  const value = decodeURIComponent(match[1]);
  const dotIndex = value.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const b64 = value.slice(0, dotIndex);
  const providedSig = value.slice(dotIndex + 1);

  if (!b64 || !providedSig) return null;

  try {
    const expectedSig = sign(b64);
    const a = Buffer.from(providedSig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null; // signature mismatch
    }

    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const payload = JSON.parse(json) as SessionPayload;

    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null; // expired
    }
    if (typeof payload.u !== 'string' || !payload.u) {
      return null;
    }

    return { username: payload.u };
  } catch {
    return null;
  }
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
  };
}
