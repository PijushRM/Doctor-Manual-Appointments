import {tr} from 'src/i18n';
import {appointmentsText} from 'src/i18n/strings/appointments';
import type {NewPatient, Patient} from 'src/types/clinic';

// What the New Appointment form holds while the doctor types.
export type PatientDraft = {
  name: string;
  age: string;
  phone: string;
  email: string;
};
export type DraftErrors = Partial<Record<keyof PatientDraft, string>>;

export const EMPTY_DRAFT: PatientDraft = {
  name: '',
  age: '',
  phone: '',
  email: '',
};

export const MAX_AGE = 120;
const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 13; // +91 and a 10-digit number
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In the current language: call when checking the form.
export const draftErrorMessages = (): Record<keyof PatientDraft, string> => {
  const t = tr(appointmentsText);
  return {
    name: t.errName,
    age: t.errAge(MAX_AGE),
    phone: t.errPhone,
    email: t.errEmail,
  };
};

export const phoneDigits = (phone: string) => phone.replace(/\D/g, '');

// Digits with common punctuation; 10–13 digits (a local number up to +91…).
export const isValidPhone = (phone: string) => {
  const digits = phoneDigits(phone).length;
  return (
    /^[+\d\s()-]+$/.test(phone) &&
    digits >= MIN_PHONE_DIGITS &&
    digits <= MAX_PHONE_DIGITS
  );
};

export const isValidEmail = (email: string) => EMAIL.test(email);

export const tidy = (text: string) => text.trim().replace(/\s+/g, ' ');

export const parsePatientDraft = (
  draft: PatientDraft,
): {patient: NewPatient | null; errors: DraftErrors} => {
  const name = tidy(draft.name);
  const age = draft.age.trim();
  const phone = draft.phone.trim();
  const email = draft.email.trim();

  const errors: DraftErrors = {};
  const messages = draftErrorMessages();
  if (name.length < 2) {
    errors.name = messages.name;
  }
  if (!/^\d{1,3}$/.test(age) || Number(age) > MAX_AGE) {
    errors.age = messages.age;
  }
  if (!isValidPhone(phone)) {
    errors.phone = messages.phone;
  }
  if (email && !isValidEmail(email)) {
    errors.email = messages.email;
  }
  if (Object.keys(errors).length) {
    return {patient: null, errors};
  }
  return {patient: {name, age: Number(age), phone, email}, errors};
};

// Compares the last 10 digits, so "+91 98300 12345" equals "9830012345".
const samePhone = (a: string, b: string) => {
  const da = phoneDigits(a);
  return (
    da.length >= MIN_PHONE_DIGITS &&
    da.slice(-MIN_PHONE_DIGITS) === phoneDigits(b).slice(-MIN_PHONE_DIGITS)
  );
};

// Same phone AND same name: families often share one phone number,
// so a phone match alone would merge a parent and child into one record.
export const findExistingPatient = (
  patients: Patient[],
  candidate: {name: string; phone: string},
) => {
  const name = tidy(candidate.name).toLowerCase();
  return patients.find(
    p =>
      tidy(p.name).toLowerCase() === name &&
      samePhone(p.phone, candidate.phone),
  );
};
