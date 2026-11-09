import {tr} from 'src/i18n';
import {authMessages} from 'src/i18n/strings/auth';
import {errorText} from 'src/i18n/strings/errors';

export const MIN_PASSWORD_LENGTH = 6;

export type LoginError =
  | 'missingIdentifier'
  | 'shortPassword'
  | 'mismatch'
  | 'exists'
  | 'offline'
  | 'server';

// In the current language: call when showing the message.
export const loginErrorMessage = (error: LoginError): string => {
  const t = tr(authMessages);
  const e = tr(errorText);
  return {
    missingIdentifier: t.missingIdentifier,
    shortPassword: t.shortPassword(MIN_PASSWORD_LENGTH),
    mismatch: t.mismatch,
    exists: t.exists,
    offline: e.offline,
    server: e.server,
  }[error];
};

export const forgotPasswordMessage = () => tr(authMessages).forgotPassword;

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

export const passwordChangeMessage = (error: PasswordChangeError): string => {
  const t = tr(authMessages);
  const e = tr(errorText);
  return {
    wrongCurrent: t.wrongCurrent,
    shortPassword: t.shortPassword(MIN_PASSWORD_LENGTH),
    notMatching: t.notMatching,
    offline: e.offline,
    server: e.server,
  }[error];
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
