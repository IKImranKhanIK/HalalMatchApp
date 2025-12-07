/**
 * JWT Utilities for Participant Authentication
 * Secure token generation and verification
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface ParticipantTokenPayload {
  participantId: string;
  participantNumber: number;
  gender: string;
  fullName: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

const TOKEN_EXPIRY = '7d'; // 7 days
const COOKIE_NAME = 'participant_token';

/**
 * Generate a signed JWT for a participant
 */
export async function generateParticipantToken(
  payload: ParticipantTokenPayload
): Promise<string> {
  return new SignJWT({
    participantId: payload.participantId,
    participantNumber: payload.participantNumber,
    gender: payload.gender,
    fullName: payload.fullName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuer('halal-match-app')
    .setAudience('participant')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a participant JWT
 */
export async function verifyParticipantToken(
  token: string
): Promise<ParticipantTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'halal-match-app',
      audience: 'participant',
    });

    return {
      participantId: payload.participantId as string,
      participantNumber: payload.participantNumber as number,
      gender: payload.gender as string,
      fullName: payload.fullName as string,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Set participant token as httpOnly cookie
 */
export async function setParticipantCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get participant token from cookie
 */
export async function getParticipantCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Clear participant cookie
 */
export async function clearParticipantCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current participant from request
 */
export async function getCurrentParticipant(): Promise<ParticipantTokenPayload | null> {
  const token = await getParticipantCookie();
  if (!token) return null;

  return verifyParticipantToken(token);
}
