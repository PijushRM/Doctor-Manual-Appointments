// Errors the doctor sees. The words are in src/i18n/strings/errors.ts.
// No React Native imports: the API layer and tests use this too.
import {tr} from 'src/i18n';
import {errorText} from 'src/i18n/strings/errors';
// An error whose message is written for the doctor and safe to show as is.
// Anything else (a bug, a library error) is shown as a general message,
// never its technical text.
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMessage = (error: unknown, fallback?: string) =>
  error instanceof AppError && error.message
    ? error.message
    : fallback ?? tr(errorText).generic;
