import {MAX_UPLOAD_MB} from '@env';

const DEFAULT_MAX_UPLOAD_MB = 1;
const MB = 1024 * 1024;

// MAX_UPLOAD_MB from .env in bytes; missing, zero, negative or not a number
// falls back to 1 MB.
export const parseMaxUploadBytes = (value: string | undefined) => {
  const mb = Number(value?.trim() || NaN);
  return Math.round(
    (Number.isFinite(mb) && mb > 0 ? mb : DEFAULT_MAX_UPLOAD_MB) * MB,
  );
};

// The largest file the app uploads: record files and the profile photo.
export const MAX_UPLOAD_BYTES = parseMaxUploadBytes(MAX_UPLOAD_MB);
