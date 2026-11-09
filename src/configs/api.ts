// The Dental backend (Next.js + MongoDB).
// Debug: the Android emulator reaches this computer's localhost at 10.0.2.2.
// On a real phone, use this computer's Wi-Fi IP instead, e.g. http://192.168.1.20:3000.
// Release: must be https (cleartext http is only allowed in debug builds).
const DEV_API_URL = 'http://10.0.2.2:3000';
const PROD_API_URL = 'https://api.example.com';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Give up on a request after this long (slow clinic Wi-Fi, server down).
export const API_TIMEOUT_MS = 20_000;
// File uploads get longer.
export const UPLOAD_TIMEOUT_MS = 120_000;
