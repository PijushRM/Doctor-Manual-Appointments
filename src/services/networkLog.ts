import {logger} from 'src/utils/logger';

// Every server call, at LOG_LEVEL=debug (the default in debug builds; see
// utils/logger.ts). Passwords and tokens are always hidden, and long answers
// are cut short.
const MAX_CHARS = 600;
const SECRET_KEYS = /^(password|current|next|confirm|token|sig)$/i;

const hideSecrets = (value: unknown): unknown =>
  JSON.parse(JSON.stringify(value ?? null), (key, v) =>
    key && SECRET_KEYS.test(key) && typeof v === 'string' ? '•••' : v,
  );

const short = (value: unknown) => {
  if (value === undefined || value === null) {
    return '';
  }
  const text = JSON.stringify(hideSecrets(value));
  return text.length > MAX_CHARS
    ? `${text.slice(0, MAX_CHARS)}… (${text.length} chars)`
    : text;
};

// File links carry a 5-minute key in ?sig=; never print it.
const safePath = (path: string) => path.replace(/([?&]sig=)[^&]+/, '$1•••');

const describeBody = (json: unknown, form?: FormData) =>
  form ? '[form with file]' : short(json);

export const logRequest = (
  method: string,
  path: string,
  json: unknown,
  form?: FormData,
) => {
  logger.debug(
    'api',
    `→ ${method} ${safePath(path)}`,
    describeBody(json, form),
  );
};

export const logResponse = (
  method: string,
  path: string,
  status: number,
  ms: number,
  body: unknown,
) => {
  const line = `← ${status} ${method} ${safePath(path)} ${ms}ms`;
  if (status >= 400) {
    logger.warn('api', line, short(body));
  } else {
    logger.debug('api', line, short(body));
  }
};

export const logFailure = (
  method: string,
  path: string,
  ms: number,
  reason: string,
) => {
  logger.warn('api', `✕ ${method} ${safePath(path)} ${ms}ms — ${reason}`);
};
