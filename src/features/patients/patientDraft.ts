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

export const DRAFT_ERROR_MESSAGES: Record<keyof PatientDraft, string> = {
  name: 'Enter the patient’s full name.',
  age: `Age 0–${MAX_AGE}`,
  phone: 'Enter a valid phone number.',
  email: 'Enter a valid email or leave it blank.',
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
  if (name.length < 2) {
    errors.name = DRAFT_ERROR_MESSAGES.name;
  }
  if (!/^\d{1,3}$/.test(age) || Number(age) > MAX_AGE) {
    errors.age = DRAFT_ERROR_MESSAGES.age;
  }
  if (!isValidPhone(phone)) {
    errors.phone = DRAFT_ERROR_MESSAGES.phone;
  }
  if (email && !isValidEmail(email)) {
    errors.email = DRAFT_ERROR_MESSAGES.email;
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
