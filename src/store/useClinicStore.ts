import {create} from 'zustand';
import {api, toEntry} from 'src/services/api';
import {currentSession, noteSave} from './session';
import type {
  Appointment,
  NewPatient,
  Patient,
  RecordEntry,
} from 'src/types/clinic';
import {logger} from 'src/utils/logger';

export type BookingWarnings = {overlaps: string[]; inPast: boolean};

// The server's data, held in memory only (nothing is saved on the phone).
// Saves go to the server first; this updates on success.
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
  (set): ClinicState => ({
    patients: [],
    appointments: [],
    entries: [],
    addAppointment: async (patient, startsAt) => {
      const session = currentSession();
      const {data, warnings} = await api.bookAppointment(startsAt, {patient});
      // Logged out while it was saving: it's on the server, not for this screen.
      if (session === currentSession()) {
        set(s => ({
          patients: upsert(s.patients, data.patient),
          appointments: upsert(s.appointments, data.appointment),
        }));
        noteSave();
        logger.info('save', `Appointment booked ${data.appointment.id}`, {
          patient: data.patient.id,
          newPatient: data.patientCreated,
          overlaps: warnings.overlaps.length,
        });
      }
      return {id: data.appointment.id, warnings};
    },
    addEntry: async entry => {
      const session = currentSession();
      const {data} = await api.addRecord(entry.patientId, entry);
      const saved = toEntry(data);
      if (session === currentSession()) {
        set(s => ({entries: upsert(s.entries, saved)}));
        noteSave();
        logger.info('save', `Record added ${saved.id}`, {
          patient: saved.patientId,
          type: saved.docType ?? 'note',
          file: !!saved.file,
        });
      }
      return saved.id;
    },
  }),
);
