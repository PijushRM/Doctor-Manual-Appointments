import type {NavigatorScreenParams} from '@react-navigation/native';
import type {DetailsDraft} from 'src/features/doctor/profileForm';
import type {NewPatient, StoredFile} from 'src/types/clinic';

export type HomeStackParamList = {
  MyPatients: undefined;
};

export type AppointmentsStackParamList = {
  NewAppointmentDetails: undefined;
  NewAppointmentDateTime: {patient: NewPatient};
};

export type PatientsStackParamList = {
  PatientList: undefined;
  // addedEntryId: just saved on Upload → green banner + "New" tag.
  PatientProfile: {patientId: string; addedEntryId?: string};
  UploadNote: {patientId: string; mode: 'upload' | 'note'};
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  About: undefined;
  EditProfileDetails: undefined;
  // From Edit Profile part 1: its values, saved together with part 2.
  // Absent when opened from Settings › Availability (save part 2 only).
  EditProfileClinic:
    | {details?: DetailsDraft & {photo?: StoredFile & {fromCamera: boolean}}}
    | undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  AppointmentsTab: NavigatorScreenParams<AppointmentsStackParamList>;
  PatientsTab: NavigatorScreenParams<PatientsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  LoadingData: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  AppointmentSaved: {appointmentId: string};
};
