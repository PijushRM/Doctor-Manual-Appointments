import {LOG_LEVEL} from '@env';

// The app's own log (front end). Every line goes to the Metro terminal and
// to `adb logcat` (tag ReactNativeJS), looking like:
//   [App] 14:03:12.481 INFO  nav    Opened Settings
//   [App] 14:03:15.002 DEBUG api    ← 201 POST /api/appointments 342ms {...}
//
// LOG_LEVEL in .env picks how much is printed: debug (everything, incl. each
// server call and its data), info (screens and actions), warn, error, or off.
// Defaults: debug in debug builds, warn in release builds (no patient data).
// Never pass passwords or tokens; api calls hide them (see networkLog.ts).
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogArea =
  | 'app'
  | 'nav'
  | 'auth'
  | 'sync'
  | 'api'
  | 'save'
  | 'settings'
  | 'reminders'
  | 'error';

const ORDER: Record<LogLevel | 'off', number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  off: 4,
};

export const parseLogLevel = (
  value: string | undefined,
  dev: boolean,
): LogLevel | 'off' => {
  const level = value?.trim().toLowerCase();
  return level && level in ORDER
    ? (level as LogLevel | 'off')
    : dev
    ? 'debug'
    : 'warn';
};

let threshold = ORDER[parseLogLevel(LOG_LEVEL, __DEV__)];

// Change the level while the app runs (or in tests).
export const setLogLevel = (level: LogLevel | 'off') => {
  threshold = ORDER[level];
};

export const logEnabled = (level: LogLevel) => ORDER[level] >= threshold;

const time = () => new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm

const write = (
  level: LogLevel,
  area: LogArea,
  message: string,
  data?: unknown,
) => {
  if (!logEnabled(level)) {
    return;
  }
  const line = `[App] ${time()} ${level.toUpperCase().padEnd(5)} ${area.padEnd(
    9,
  )} ${message}`;
  const out =
    level === 'error'
      ? console.error
      : level === 'warn'
      ? console.warn
      : console.log;
  if (data === undefined) {
    out(line);
  } else {
    out(line, data);
  }
};

export const logger = {
  debug: (area: LogArea, message: string, data?: unknown) =>
    write('debug', area, message, data),
  info: (area: LogArea, message: string, data?: unknown) =>
    write('info', area, message, data),
  warn: (area: LogArea, message: string, data?: unknown) =>
    write('warn', area, message, data),
  error: (area: LogArea, message: string, data?: unknown) =>
    write('error', area, message, data),
};
