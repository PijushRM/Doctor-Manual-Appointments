// Values from .env, inlined at build time by react-native-dotenv (babel.config.js).
// Undefined when missing from .env.
declare module '@env' {
  export const API_URL: string | undefined;
  export const MAX_UPLOAD_MB: string | undefined;
}
