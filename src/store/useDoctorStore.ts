import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from 'src/configs/storage';
import {DEFAULT_CLINIC_HOURS} from 'src/constants/appointments';
import type {DoctorProfile} from 'src/types/clinic';

export type {DoctorProfile};

const EMPTY_PROFILE: DoctorProfile = {
  name: '',
  qualifications: '',
  speciality: '',
  email: '',
  phone: '',
  clinicName: '',
  ...DEFAULT_CLINIC_HOURS,
  workingDays: [false, true, true, true, true, true, true], // Mon–Sat
  photoUri: '',
};

type DoctorState = {
  profile: DoctorProfile;
  updateProfile: (changes: Partial<DoctorProfile>) => void;
  // Settings › Appointment alerts: a reminder 15 minutes before each visit.
  alerts: boolean;
  setAlerts: (on: boolean) => void;
};

export const useDoctorStore = create<DoctorState>()(
  persist(
    (set): DoctorState => ({
      profile: EMPTY_PROFILE,
      updateProfile: changes =>
        set(s => ({profile: {...s.profile, ...changes}})),
      alerts: false,
      setAlerts: alerts => set({alerts}),
    }),
    {
      name: 'doctor',
      storage: zustandStorage,
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
