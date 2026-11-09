import {defineStrings} from '../index';

// Settings screen and its pop-ups.
export const settingsText = defineStrings({
  back: 'Back to profile',
  title: 'Settings',
  practice: 'Practice',
  availability: 'Availability & slots',
  alerts: 'Appointment alerts',
  app: 'App',
  language: 'Language',
  chooseLanguage: 'Choose language',
  languageHint: 'The app and the SMS to patients use this language.',
  account: 'Account',
  changePassword: 'Change password',
  logOut: 'Log out',
  logOutTitle: 'Log out?',
  logOutBody:
    'Your patients and appointments are saved to your account. You’ll need your password to log back in.',
  cancel: 'Cancel',
  notificationsOffTitle: 'Notifications are off',
  notificationsOffBody:
    'Allow notifications for Smile Doctor in Settings to get a reminder 15 minutes before each appointment.',
  notNow: 'Not now',
  openSettings: 'Open Settings',
  openSettingsFailed: 'Couldn’t open Settings',
  openSettingsFallback: 'Open Settings › Apps › Smile Doctor on your phone.',
  alertsFailed: 'Couldn’t change appointment alerts',
})({
  back: 'প্রোফাইলে ফিরুন',
  title: 'সেটিংস',
  practice: 'প্র্যাকটিস',
  availability: 'সময় ও স্লট',
  alerts: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার',
  app: 'অ্যাপ',
  language: 'ভাষা',
  chooseLanguage: 'ভাষা বেছে নিন',
  languageHint: 'অ্যাপ এবং রোগীদের SMS এই ভাষায় হবে।',
  account: 'অ্যাকাউন্ট',
  changePassword: 'পাসওয়ার্ড বদলান',
  logOut: 'লগ আউট',
  logOutTitle: 'লগ আউট করবেন?',
  logOutBody:
    'আপনার রোগী ও অ্যাপয়েন্টমেন্ট আপনার অ্যাকাউন্টে সংরক্ষিত আছে। আবার লগ ইন করতে পাসওয়ার্ড লাগবে।',
  cancel: 'বাতিল',
  notificationsOffTitle: 'নোটিফিকেশন বন্ধ আছে',
  notificationsOffBody:
    'প্রতিটি অ্যাপয়েন্টমেন্টের ১৫ মিনিট আগে রিমাইন্ডার পেতে সেটিংসে Smile Doctor-এর নোটিফিকেশন চালু করুন।',
  notNow: 'এখন নয়',
  openSettings: 'সেটিংস খুলুন',
  openSettingsFailed: 'সেটিংস খোলা গেল না',
  openSettingsFallback: 'ফোনের Settings › Apps › Smile Doctor খুলুন।',
  alertsFailed: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার বদলানো গেল না',
});
