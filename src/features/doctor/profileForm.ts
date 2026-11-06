import {
  isValidEmail,
  isValidPhone,
  tidy,
} from 'src/features/patients/patientDraft';
import type {DoctorProfile} from 'src/types/clinic';

// Edit Profile, part 1 and part 2.
export type DetailsDraft = Pick<
  DoctorProfile,
  'name' | 'qualifications' | 'speciality'
>;
export type ClinicDraft = Pick<
  DoctorProfile,
  'email' | 'phone' | 'clinicName' | 'opens' | 'closes' | 'workingDays'
>;

export const PROFILE_ERRORS = {
  name: 'Enter your name.',
  email: 'Enter a valid email or leave it blank.',
  phone: 'Enter a valid phone number or leave it blank.',
  hours: 'Closing time must be after opening time.',
  days: 'Pick at least one working day.',
};
type ErrorKey = keyof typeof PROFILE_ERRORS;
export type ProfileErrors = Partial<Record<ErrorKey, string>>;

const only = (keys: ErrorKey[]): ProfileErrors =>
  Object.fromEntries(keys.map(k => [k, PROFILE_ERRORS[k]]));

export const parseDetails = (draft: DetailsDraft) => {
  const values = {
    name: tidy(draft.name),
    qualifications: tidy(draft.qualifications),
    speciality: tidy(draft.speciality),
  };
  return {values, errors: only(values.name.length < 2 ? ['name'] : [])};
};

export const parseClinic = (draft: ClinicDraft) => {
  const values = {
    ...draft,
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    clinicName: tidy(draft.clinicName),
  };
  const problems: ErrorKey[] = [];
  if (values.email && !isValidEmail(values.email)) {
    problems.push('email');
  }
  if (values.phone && !isValidPhone(values.phone)) {
    problems.push('phone');
  }
  if (values.closes <= values.opens) {
    problems.push('hours');
  }
  if (!values.workingDays.some(Boolean)) {
    problems.push('days');
  }
  return {values, errors: only(problems)};
};
