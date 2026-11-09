import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from 'src/configs/storage';
import {DEFAULT_CLINIC_HOURS} from 'src/constants/appointments';
import {api, type ServerDoctor} from 'src/services/api';
import {currentSession, noteSave} from './session';
import type {DoctorProfile, StoredFile} from 'src/types/clinic';
import {logger} from 'src/utils/logger';

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
  photoUrl: '',
};

export type ProfileChanges = Partial<Omit<DoctorProfile, 'photoUrl'>>;

type DoctorState = {
  profile: DoctorProfile; // the server's profile, in memory only
  // Saves to the server (photo first, if any), then shows the server's copy.
  // Throws ApiError when the server can't be reached or refuses.
  saveProfile: (changes: ProfileChanges, photo?: StoredFile) => Promise<void>;
  // Settings › Appointment alerts: a reminder 15 minutes before each visit.
  // A setting for this phone's notifications, not doctor data: the only part
  // of this store saved on the phone.
  alerts: boolean;
  setAlerts: (on: boolean) => void;
};

export const fromServer = (doctor: ServerDoctor): DoctorProfile => ({
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
});

export const useDoctorStore = create<DoctorState>()(
  persist(
    (set): DoctorState => ({
      profile: EMPTY_PROFILE,
      saveProfile: async (changes, photo) => {
        const session = currentSession();
        const show = (doctor: ServerDoctor) => {
          if (session === currentSession()) {
            set({profile: fromServer(doctor)});
            noteSave();
          }
        };
        if (photo) {
          // Shown straight away: the server has already deleted the old
          // photo, so it must not stay on screen if the next step fails.
          show((await api.uploadPhoto(photo)).doctor);
        }
        show((await api.updateProfile(changes)).doctor);
        logger.info('save', 'Profile saved', {
          fields: Object.keys(changes),
          photo: !!photo,
        });
      },
      alerts: false,
      setAlerts: alerts => set({alerts}),
    }),
    {
      // Not "doctor": that key held the old on-phone profile (removed at launch).
      name: 'doctor-settings',
      storage: zustandStorage,
      partialize: s => ({alerts: s.alerts}),
    },
  ),
);
