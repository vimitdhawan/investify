'server-only';
import { SignJWT, jwtVerify, createRemoteJWKSet, importPKCS8 } from 'jose';
import { cookies } from 'next/headers';

type SessionPayload = {
  userId: string;
};

// Get the JWKS URL from environment variables
const jwksUrl = process.env.JWKS_URL;
if (!jwksUrl) {
  throw new Error('JWKS_URL environment variable is not set.');
}

// Create a remote JWK set from the Firebase Storage URL
const JWKS = createRemoteJWKSet(new URL(jwksUrl));

export async function encrypt(payload: SessionPayload) {
  const privateKeyString = process.env.AUTH_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error('AUTH_PRIVATE_KEY environment variable is not set.');
  }
  const privateKey = await importPKCS8(privateKeyString, 'RS256');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(privateKey);
}

export async function decrypt(session: string) {
  try {
    const { payload } = await jwtVerify(session, JWKS, {
      algorithms: ['RS256'],
    });
    return payload;
  } catch (error) {
    console.error('Failed to decrypt session:', error);
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) {
    return null;
  }
  const payload = await decrypt(session);
  if (!payload) {
    return null;
  }
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSessionUserId(): Promise<string | null> {
  console.log('Attempting to get session user ID...');
  const session = (await cookies()).get('session')?.value;
  if (!session) {
    console.log('No session cookie found.');
    return null;
  }

  const payload = await decrypt(session);

  if (payload && typeof payload.userId === 'string') {
    return payload.userId;
  }

  console.log('User ID not found or not a string in payload.');
  return null;
}
