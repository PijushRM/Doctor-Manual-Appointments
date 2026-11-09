import {OFFLINE_MESSAGE, SERVER_MESSAGE} from 'src/utils/errors';
export const MIN_PASSWORD_LENGTH = 6;

export type LoginError =
  | 'missingIdentifier'
  | 'shortPassword'
  | 'mismatch'
  | 'exists'
  | 'offline'
  | 'server';

export {OFFLINE_MESSAGE, SERVER_MESSAGE};

export const LOGIN_ERROR_MESSAGES: Record<LoginError, string> = {
  missingIdentifier: 'Enter your email or registration ID.',
  shortPassword: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  mismatch: 'Email/ID or password is incorrect.',
  exists: 'An account with this email or ID already exists. Log in instead.',
  offline: OFFLINE_MESSAGE,
  server: SERVER_MESSAGE,
};

export const FORGOT_PASSWORD_MESSAGE =
  'Password reset isn’t available in the app yet. Please contact your clinic admin.';

export const normalizeIdentifier = (identifier: string) =>
  identifier.trim().toLowerCase();

export const validateLogin = (
  identifier: string,
  password: string,
): LoginError | null => {
  if (!normalizeIdentifier(identifier)) {
    return 'missingIdentifier';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'shortPassword';
  }
  return null;
};

export type PasswordChangeError =
  | 'wrongCurrent'
  | 'shortPassword'
  | 'notMatching'
  | 'offline'
  | 'server';

export const PASSWORD_CHANGE_MESSAGES: Record<PasswordChangeError, string> = {
  wrongCurrent: 'Your current password is incorrect.',
  shortPassword: LOGIN_ERROR_MESSAGES.shortPassword,
  notMatching: 'The new passwords don’t match.',
  offline: OFFLINE_MESSAGE,
  server: SERVER_MESSAGE,
};

// Checked on the phone first so typos don't cost a round trip;
// the server checks the current password.
export const validatePasswordChange = (
  next: string,
  confirm: string,
): PasswordChangeError | null => {
  if (next.length < MIN_PASSWORD_LENGTH) {
    return 'shortPassword';
  }
  return next === confirm ? null : 'notMatching';
};
