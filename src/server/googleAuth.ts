import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthedUser } from './types';

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function verifyGoogleCredential(credential: string, clientId: string): Promise<AuthedUser> {
  const { payload } = await jwtVerify(credential, googleJwks, {
    audience: clientId,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
  });
  if (!payload.email || payload.email_verified !== true) throw new Error('Google email is not verified');
  return {
    email: String(payload.email).toLowerCase(),
    name: typeof payload.name === 'string' ? payload.name : undefined,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
  };
}
