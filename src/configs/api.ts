import {API_URL as ENV_API_URL} from '@env';

// The Dental backend (Next.js + MongoDB). The base URL comes from API_URL in .env
// (see .env.example); .env.development / .env.production override it per build type.
// Release builds need https (cleartext http is only allowed in debug builds).
// Inlined at build time: after editing .env, restart Metro with `bun start --reset-cache`.
if (!ENV_API_URL) {
  throw new Error('API_URL is missing. Copy .env.example to .env and set it.');
}

// Request paths start with /api/..., so drop any trailing slash.
export const API_URL = ENV_API_URL.replace(/\/+$/, '');

// Give up on a request after this long (slow clinic Wi-Fi, server down).
export const API_TIMEOUT_MS = 20_000;
// File uploads get longer.
export const UPLOAD_TIMEOUT_MS = 120_000;
