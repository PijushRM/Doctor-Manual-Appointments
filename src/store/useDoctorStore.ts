import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from 'src/configs/storage';
import {DEFAULT_CLINIC_HOURS} from 'src/constants/appointments';
import {api, type ServerDoctor} from 'src/services/api';
import type {DoctorProfile, StoredFile} from 'src/types/clinic';

export type {DoctorProfile};

export const EMPTY_PROFILE: DoctorProfile = {
  name: '',
  qualifications: '',
  speciality: '',
  email: '',
  phone: '',
  clinicName: '',
  ...DEFAULT_CLINIC_HOURS,
  workingDays: [false, true, true, true, true, true, true], // Mon–Sat
  photoUri: '',
  photoUrl: '',
};

export type ProfileChanges = Partial<
  Omit<DoctorProfile, 'photoUri' | 'photoUrl'>
>;

type DoctorState = {
  profile: DoctorProfile; // cache of the server's profile
  // Saves to the server (photo first, if any), then updates the cache.
  // Throws ApiError when the server can't be reached or refuses.
  saveProfile: (changes: ProfileChanges, photo?: StoredFile) => Promise<void>;
  // Settings › Appointment alerts: a reminder 15 minutes before each visit.
  // Per phone (it needs this phone's notification permission), so not synced.
  alerts: boolean;
  setAlerts: (on: boolean) => void;
};

export const fromServer = (
  doctor: ServerDoctor,
  photoUri: string,
): DoctorProfile => ({
  name: doctor.name,
  qualifications: doctor.qualifications,
  speciality: doctor.speciality,
  email: doctor.email,
  phone: doctor.phone,
  clinicName: doctor.clinicName,
  opens: doctor.opens,
  closes: doctor.closes,
  workingDays: doctor.workingDays,
  photoUrl: doctor.photoUrl,
  photoUri,
});

export const useDoctorStore = create<DoctorState>()(
  persist(
    (set, get): DoctorState => ({
      profile: EMPTY_PROFILE,
      saveProfile: async (changes, photo) => {
        let photoUri = get().profile.photoUri;
        if (photo) {
          await api.uploadPhoto(photo);
          photoUri = photo.uri;
        }
        const {doctor} = await api.updateProfile(changes);
        set({profile: fromServer(doctor, photoUri)});
      },
      alerts: false,
      setAlerts: alerts => set({alerts}),
    }),
    {
      name: 'doctor',
      storage: zustandStorage,
      partialize: s => ({profile: s.profile, alerts: s.alerts}),
      // Keep every saved field; a profile saved by an older version gets
      // defaults for any profile field added since.
      merge: (saved, current) => {
        const persisted = saved as Partial<DoctorState> | undefined;
        return {
          ...current,
          ...persisted,
          profile: {...current.profile, ...persisted?.profile},
        };
      },
    },
  ),
);
