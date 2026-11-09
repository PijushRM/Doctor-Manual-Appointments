import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from 'src/configs/storage';
import {api, toEntry} from 'src/services/api';
import type {
  Appointment,
  NewPatient,
  Patient,
  RecordEntry,
} from 'src/types/clinic';

export type BookingWarnings = {overlaps: string[]; inPast: boolean};

// A cache of the server's data, kept on the phone so screens and reminders
// work offline. Saves go to the server first; the cache updates on success.
type ClinicState = {
  patients: Patient[];
  appointments: Appointment[];
  entries: RecordEntry[];
  // The server reuses a matching patient (same name + phone), else adds one.
  // Throws ApiError when the server can't be reached or refuses.
  addAppointment: (
    patient: NewPatient,
    startsAt: Date,
  ) => Promise<{id: string; warnings: BookingWarnings}>;
  // Uploads and notes ("Add to record"). Returns the new entry's id.
  addEntry: (entry: Omit<RecordEntry, 'id' | 'at'>) => Promise<string>;
};

const upsert = <T extends {id: string}>(list: T[], item: T) =>
  list.some(x => x.id === item.id)
    ? list.map(x => (x.id === item.id ? item : x))
    : [...list, item];

export const useClinicStore = create<ClinicState>()(
  persist(
    (set): ClinicState => ({
      patients: [],
      appointments: [],
      entries: [],
      addAppointment: async (patient, startsAt) => {
        const {data, warnings} = await api.bookAppointment(startsAt, {patient});
        set(s => ({
          patients: upsert(s.patients, data.patient),
          appointments: upsert(s.appointments, data.appointment),
        }));
        return {id: data.appointment.id, warnings};
      },
      addEntry: async entry => {
        const {data} = await api.addRecord(entry.patientId, entry);
        // Keep the local copy so this phone opens the file without downloading.
        const saved = toEntry(data, entry.file?.uri);
        set(s => ({entries: upsert(s.entries, saved)}));
        return saved.id;
      },
    }),
    {
      name: 'clinic',
      storage: zustandStorage,
      partialize: s => ({
        patients: s.patients,
        appointments: s.appointments,
        entries: s.entries,
      }),
    },
  ),
);
