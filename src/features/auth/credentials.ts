import {sha256} from 'js-sha256';

export const MIN_PASSWORD_LENGTH = 6;

export type LoginError = 'missingIdentifier' | 'shortPassword' | 'mismatch';

export const LOGIN_ERROR_MESSAGES: Record<LoginError, string> = {
  missingIdentifier: 'Enter your email or registration ID.',
  shortPassword: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  mismatch: 'Email/ID or password is incorrect.',
};

export const FORGOT_PASSWORD_MESSAGE =
  'Your password is stored only on this phone and can’t be recovered here. Please contact your clinic admin.';

// The one doctor account on this device: the first successful login claims it.
export type Account = {identifier: string; salt: string; hash: string};

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

export const hashPassword = (password: string, salt: string) =>
  sha256(`${salt}:${password}`);

// ponytail: non-crypto salt; fine while the hash only lives in encrypted MMKV.
// Use react-native-get-random-values if accounts ever leave the device.
const makeSalt = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const createAccount = (
  identifier: string,
  password: string,
  salt = makeSalt(),
): Account => ({
  identifier: normalizeIdentifier(identifier),
  salt,
  hash: hashPassword(password, salt),
});

export const matchesAccount = (
  account: Account,
  identifier: string,
  password: string,
) =>
  normalizeIdentifier(identifier) === account.identifier &&
  hashPassword(password, account.salt) === account.hash;

export type PasswordChangeError =
  | 'wrongCurrent'
  | 'shortPassword'
  | 'notMatching';

export const PASSWORD_CHANGE_MESSAGES: Record<PasswordChangeError, string> = {
  wrongCurrent: 'Your current password is incorrect.',
  shortPassword: LOGIN_ERROR_MESSAGES.shortPassword,
  notMatching: 'The new passwords don’t match.',
};

export const validatePasswordChange = (
  account: Account,
  current: string,
  next: string,
  confirm: string,
): PasswordChangeError | null => {
  if (hashPassword(current, account.salt) !== account.hash) {
    return 'wrongCurrent';
  }
  if (next.length < MIN_PASSWORD_LENGTH) {
    return 'shortPassword';
  }
  return next === confirm ? null : 'notMatching';
};
