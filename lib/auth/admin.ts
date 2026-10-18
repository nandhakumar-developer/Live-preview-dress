import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

interface AdminAuthConfig {
  username: string;
  password: string;
  sessionSecret: string;
}

interface AdminSessionPayload {
  sub: string;
  exp: number;
}

export function getAdminAuthConfig(): AdminAuthConfig | null {
  const username = process.env.ADMIN_LOGIN_USERNAME?.trim();
  const password = process.env.ADMIN_LOGIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !password || !sessionSecret || Buffer.byteLength(sessionSecret) < 32) {
    return null;
  }

  return { username, password, sessionSecret };
}

function signPayload(payload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(payload).digest();
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftHash = createHmac('sha256', 'admin-credential-comparison').update(left).digest();
  const rightHash = createHmac('sha256', 'admin-credential-comparison').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const config = getAdminAuthConfig();
  if (!config) return false;

  return (
    constantTimeEqual(username, config.username) &&
    constantTimeEqual(password, config.password)
  );
}

export function createAdminSessionToken(username: string): string {
  const config = getAdminAuthConfig();
  if (!config) {
    throw new Error('Admin login is not configured correctly.');
  }

  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
    } satisfies AdminSessionPayload)
  ).toString('base64url');

  const signature = signPayload(payload, config.sessionSecret).toString('base64url');
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const config = getAdminAuthConfig();
  if (!config || !token || token.length > 2048) return false;

  const [payload, encodedSignature, extraPart] = token.split('.');
  if (!payload || !encodedSignature || extraPart !== undefined) return false;

  let receivedSignature: Buffer;
  let session: AdminSessionPayload;
  try {
    receivedSignature = Buffer.from(encodedSignature, 'base64url');
    session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSessionPayload;
  } catch {
    return false;
  }

  const expectedSignature = signPayload(payload, config.sessionSecret);
  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return false;
  }

  return (
    session.sub === config.username &&
    Number.isSafeInteger(session.exp) &&
    session.exp > Math.floor(Date.now() / 1000)
  );
}

export async function isAdminSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminSessionValid())) {
    redirect('/admin/login');
  }
}
