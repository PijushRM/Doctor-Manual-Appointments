import {
  isValidEmail,
  isValidPhone,
  tidy,
} from 'src/features/patients/patientDraft';
import {tr} from 'src/i18n';
import {profileText} from 'src/i18n/strings/profile';
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

type ErrorKey = 'name' | 'email' | 'phone' | 'hours' | 'days';
export type ProfileErrors = Partial<Record<ErrorKey, string>>;

// In the current language: read when the form is checked.
export const profileErrors = (): Record<ErrorKey, string> => {
  const t = tr(profileText);
  return {
    name: t.errName,
    email: t.errEmail,
    phone: t.errPhone,
    hours: t.errHours,
    days: t.errDays,
  };
};

const only = (keys: ErrorKey[]): ProfileErrors => {
  const messages = profileErrors();
  return Object.fromEntries(keys.map(k => [k, messages[k]]));
};

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
