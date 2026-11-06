// Dates are ISO strings so they survive JSON persistence unchanged.
export type Patient = {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  startsAt: string;
  createdAt: string; // when it was booked (an activity on the Patients list)
};

// A patient as entered on New Appointment, before it is saved.
export type NewPatient = Omit<Patient, 'id' | 'createdAt'>;

export type DocType = 'prescription' | 'report' | 'xray' | 'other';

// A copy kept in the app's documents folder (not the picker's temporary uri).
export type StoredFile = {
  uri: string;
  name: string;
  size: number; // bytes
  mimeType: string;
};

// An upload or a note on a patient's record ("Add to record").
export type RecordEntry = {
  id: string;
  patientId: string;
  at: string;
  docType: DocType | null; // null = note only
  file: StoredFile | null;
  note: string;
};

// The doctor using this phone (Profile / Edit Profile).
export type DoctorProfile = {
  name: string;
  qualifications: string;
  speciality: string;
  email: string;
  phone: string;
  clinicName: string;
  opens: number; // minutes from midnight
  closes: number;
  workingDays: boolean[]; // 7 entries, Sunday first (Date#getDay order)
  photoUri: string;
};
