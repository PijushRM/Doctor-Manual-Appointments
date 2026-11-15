import {buildNumber, version} from '../../package.json';

// android/app/build.gradle reads the same fields for versionName / versionCode.
export const APP_VERSION = version;
export const BUILD_NUMBER = buildNumber;

// About › Developed by comes from the server (GET /api/about, set in its .env).
