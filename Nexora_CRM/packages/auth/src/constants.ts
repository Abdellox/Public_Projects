export const SESSION_COOKIE_NAME = 'nx_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60;

export const INVITATION_TOKEN_TTL_DAYS = 7;
export const INVITATION_TTL_MS = INVITATION_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export function sessionExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + SESSION_TTL_SECONDS * 1000);
}

export function invitationExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITATION_TTL_MS);
}
