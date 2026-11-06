import {buildNumber, version} from '../../package.json';

// android/app/build.gradle reads the same fields for versionName / versionCode.
export const APP_VERSION = version;
export const BUILD_NUMBER = buildNumber;

// About › Developed by. Values in [brackets] are placeholders: shown as-is and
// not tappable. Replace them to make the rows open mail / phone / browser.
export const DEVELOPER = {
  name: '[Developer / company name]',
  email: '[support@yourcompany.com]',
  phone: '[+91 XXXXX XXXXX]',
  website: '[www.yourcompany.com]',
};
