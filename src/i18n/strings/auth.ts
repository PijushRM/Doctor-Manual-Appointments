import {bengaliDigits} from '../format';
import {defineStrings} from '../index';

// Login and password messages (the screens' own labels are added with them).
export const authMessages = defineStrings({
  missingIdentifier: 'Enter your email or registration ID.',
  shortPassword: (min: number) =>
    `Password must be at least ${min} characters.`,
  mismatch: 'Email/ID or password is incorrect.',
  exists: 'An account with this email or ID already exists. Log in instead.',
  forgotPassword:
    'Password reset isn’t available in the app yet. Please contact your clinic admin.',
  wrongCurrent: 'Your current password is incorrect.',
  notMatching: 'The new passwords don’t match.',
})({
  missingIdentifier: 'আপনার ইমেল বা রেজিস্ট্রেশন আইডি লিখুন।',
  shortPassword: (min: number) =>
    `পাসওয়ার্ডে অন্তত ${bengaliDigits(min)}টি অক্ষর থাকতে হবে।`,
  mismatch: 'ইমেল/আইডি বা পাসওয়ার্ড ভুল।',
  exists: 'এই ইমেল বা আইডি দিয়ে আগেই অ্যাকাউন্ট আছে। লগ ইন করুন।',
  forgotPassword:
    'অ্যাপে এখনও পাসওয়ার্ড রিসেট করা যায় না। আপনার ক্লিনিকের অ্যাডমিনের সাথে যোগাযোগ করুন।',
  wrongCurrent: 'আপনার বর্তমান পাসওয়ার্ড ভুল।',
  notMatching: 'নতুন পাসওয়ার্ড দুটি মিলছে না।',
});

// Login screen.
export const loginText = defineStrings({
  portal: 'Doctor portal',
  welcome: 'Welcome,',
  doctor: 'Doctor',
  registerIntro:
    'Create your account to keep patients and appointments safe online.',
  loginIntro: 'Log in to manage appointments and your patients.',
  identifier: 'Email or registration ID',
  password: 'Password',
  passwordPlaceholder: 'Enter your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  forgotPassword: 'Forgot password?',
  staffOnly: 'For clinic doctors and staff only',
  createAccount: 'Create account',
  creatingAccount: 'Creating account…',
  logIn: 'Log in',
  loggingIn: 'Logging in…',
  haveAccount: 'Already have an account? Log in',
  newHere: 'New here? Create an account',
})({
  portal: 'ডাক্তার পোর্টাল',
  welcome: 'স্বাগতম,',
  doctor: 'ডাক্তার',
  registerIntro:
    'রোগী ও অ্যাপয়েন্টমেন্ট অনলাইনে নিরাপদ রাখতে আপনার অ্যাকাউন্ট তৈরি করুন।',
  loginIntro: 'অ্যাপয়েন্টমেন্ট ও আপনার রোগীদের দেখতে লগ ইন করুন।',
  identifier: 'ইমেল বা রেজিস্ট্রেশন আইডি',
  password: 'পাসওয়ার্ড',
  passwordPlaceholder: 'আপনার পাসওয়ার্ড লিখুন',
  showPassword: 'পাসওয়ার্ড দেখান',
  hidePassword: 'পাসওয়ার্ড লুকান',
  forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
  staffOnly: 'শুধু ক্লিনিকের ডাক্তার ও কর্মীদের জন্য',
  createAccount: 'অ্যাকাউন্ট তৈরি করুন',
  creatingAccount: 'অ্যাকাউন্ট তৈরি হচ্ছে…',
  logIn: 'লগ ইন',
  loggingIn: 'লগ ইন হচ্ছে…',
  haveAccount: 'আগে থেকেই অ্যাকাউন্ট আছে? লগ ইন করুন',
  newHere: 'নতুন? অ্যাকাউন্ট তৈরি করুন',
});

// Change password screen.
export const changePasswordText = defineStrings({
  back: 'Back to settings',
  titleStart: 'Change ',
  titleAccent: 'password',
  current: 'Current password',
  currentPlaceholder: 'Enter your current password',
  next: 'New password',
  nextPlaceholder: (min: number) => `At least ${min} characters`,
  nextHint: (min: number) => `AT LEAST ${min} CHARACTERS`,
  confirm: 'Confirm new password',
  confirmPlaceholder: 'Type the new password again',
  save: 'Save password',
  saving: 'Saving…',
  failed: 'Couldn’t change the password',
  changed: 'Password changed',
  changedBody: 'Use your new password next time you log in.',
})({
  back: 'সেটিংসে ফিরুন',
  titleStart: 'পাসওয়ার্ড ',
  titleAccent: 'বদলান',
  current: 'বর্তমান পাসওয়ার্ড',
  currentPlaceholder: 'আপনার বর্তমান পাসওয়ার্ড লিখুন',
  next: 'নতুন পাসওয়ার্ড',
  nextPlaceholder: (min: number) => `অন্তত ${bengaliDigits(min)}টি অক্ষর`,
  nextHint: (min: number) => `অন্তত ${bengaliDigits(min)}টি অক্ষর`,
  confirm: 'নতুন পাসওয়ার্ড আবার লিখুন',
  confirmPlaceholder: 'নতুন পাসওয়ার্ডটি আবার লিখুন',
  save: 'পাসওয়ার্ড সংরক্ষণ করুন',
  saving: 'সংরক্ষণ হচ্ছে…',
  failed: 'পাসওয়ার্ড বদলানো গেল না',
  changed: 'পাসওয়ার্ড বদলানো হয়েছে',
  changedBody: 'পরের বার লগ ইন করার সময় নতুন পাসওয়ার্ড ব্যবহার করুন।',
});

// The screen shown while the clinic's data first loads.
export const loadingText = defineStrings({
  loading: 'Loading your clinic…',
  failed: 'Couldn’t load your clinic',
  tryAgain: 'Try again',
  logOut: 'Log out',
})({
  loading: 'আপনার ক্লিনিকের তথ্য লোড হচ্ছে…',
  failed: 'আপনার ক্লিনিকের তথ্য লোড করা গেল না',
  tryAgain: 'আবার চেষ্টা করুন',
  logOut: 'লগ আউট',
});
