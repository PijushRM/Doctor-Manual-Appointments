import type {Patient} from 'src/types/clinic';

// "New" tag on patients added in the last 24 hours.
export const NEW_PATIENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export const isNewPatient = (patient: Patient, now: Date) =>
  now.getTime() - new Date(patient.createdAt).getTime() < NEW_PATIENT_WINDOW_MS;

// "Rahul Saha" → "RS", "Priya" → "P", "Arun Kumar Das" → "AD".
export const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return '';
  }
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (words[0][0] + last).toUpperCase();
};

// For names styled "Amit [Das]": everything but the last word, then the last word.
export const splitSurname = (name: string) => {
  const words = name.trim().split(/\s+/);
  return {
    firstNames: words.length > 1 ? `${words.slice(0, -1).join(' ')} ` : '',
    surname: words[words.length - 1] ?? '',
  };
};

// "Dr. Subhas Middya" → "SM" (the design skips the title).
export const doctorInitials = (name: string) =>
  initials(name.replace(/^dr\.?\s+/i, ''));
