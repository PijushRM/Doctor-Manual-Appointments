import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from 'src/configs/storage';
import {findExistingPatient} from 'src/features/patients/patientDraft';
import type {
  Appointment,
  NewPatient,
  Patient,
  RecordEntry,
} from 'src/types/clinic';
import {makeId} from 'src/utils/id';

type ClinicState = {
  patients: Patient[];
  appointments: Appointment[];
  // Reuses a matching patient (same name + phone), else adds one.
  // Returns the new appointment's id.
  addAppointment: (patient: NewPatient, startsAt: Date, now?: Date) => string;
  entries: RecordEntry[];
  // Uploads and notes ("Add to record"). Returns the new entry's id.
  addEntry: (entry: Omit<RecordEntry, 'id' | 'at'>, now?: Date) => string;
};

export const useClinicStore = create<ClinicState>()(
  persist(
    (set, get): ClinicState => ({
      patients: [],
      appointments: [],
      entries: [],
      addEntry: (entry, now = new Date()) => {
        const id = makeId();
        set(s => ({
          entries: [...s.entries, {...entry, id, at: now.toISOString()}],
        }));
        return id;
      },
      addAppointment: (patient, startsAt, now = new Date()) => {
        const existing = findExistingPatient(get().patients, patient);
        const saved = existing ?? {
          ...patient,
          id: makeId(),
          createdAt: now.toISOString(),
        };
        const appointment = {
          id: makeId(),
          patientId: saved.id,
          startsAt: startsAt.toISOString(),
          createdAt: now.toISOString(),
        };
        set(s => ({
          patients: existing ? s.patients : [...s.patients, saved],
          appointments: [...s.appointments, appointment],
        }));
        return appointment.id;
      },
    }),
    {name: 'clinic', storage: zustandStorage},
  ),
);
