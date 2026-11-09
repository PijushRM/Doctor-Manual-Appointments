import {Alert} from 'react-native';
import {AppError, errorMessage} from './errors';
import {logger} from './logger';

// The standard error pop-up: a short title saying what failed, then why.
// Errors not written for the doctor (bugs, library errors) are logged and
// shown with `fallback` (or a general message), never their technical text.
export const showError = (title: string, error: unknown, fallback?: string) => {
  if (!(error instanceof AppError)) {
    logger.warn('error', title, error);
  }
  Alert.alert(title, errorMessage(error, fallback));
};
