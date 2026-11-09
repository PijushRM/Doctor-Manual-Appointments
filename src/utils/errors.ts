// One place for the words the doctor sees when something fails.
// No React Native imports: the API layer and tests use this too.
export const OFFLINE_MESSAGE =
  'Can’t reach the server. Check your internet and try again.';
export const TIMEOUT_MESSAGE =
  'The server is taking too long to answer. Check your internet and try again.';
export const SERVER_MESSAGE =
  'Something went wrong on our side. Please try again.';
export const UNAVAILABLE_MESSAGE =
  'The server isn’t available right now. Please try again in a few minutes.';
export const UNEXPECTED_MESSAGE =
  'The server sent an answer the app doesn’t understand. Please try again.';
export const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

// An error whose message is written for the doctor and safe to show as is.
// Anything else (a bug, a library error) is shown as a general message,
// never its technical text.
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMessage = (error: unknown, fallback = GENERIC_MESSAGE) =>
  error instanceof AppError && error.message ? error.message : fallback;
