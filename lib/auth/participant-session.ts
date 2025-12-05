/**
 * Participant Session Management
 * Simple session management for participants using localStorage
 */

export interface ParticipantSession {
  id: string;
  participant_number: number;
  full_name: string;
  gender: string;
}

const SESSION_KEY = 'participant_session';

/**
 * Save participant session to localStorage
 */
export function saveParticipantSession(session: ParticipantSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Get participant session from localStorage
 */
export function getParticipantSession(): ParticipantSession | null {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Clear participant session
 */
export function clearParticipantSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Check if participant is logged in
 */
export function isParticipantLoggedIn(): boolean {
  return getParticipantSession() !== null;
}
