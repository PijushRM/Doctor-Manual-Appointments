import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {APP_VERSION} from 'src/constants/app';
import {countByTab, countThisWeek} from 'src/features/appointments/dayGroups';
import {formatClinicHours} from 'src/features/doctor/clinicHours';
import {doctorInitials, splitSurname} from 'src/features/patients/patients';
import type {ProfileStackParamList} from 'src/navigation/types';
import {useClinicStore} from 'src/store/useClinicStore';
import {profilePhotoSource} from 'src/features/doctor/photo';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {useNow} from './useNow';

export const useProfileViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'Profile'>>();
  const profile = useDoctorStore(s => s.profile);
  const patientCount = useClinicStore(s => s.patients.length);
  const appointments = useClinicStore(s => s.appointments);
  const now = useNow();

  const name = profile.name || 'Doctor';

  return {
    photo: profilePhotoSource(profile),
    initials: doctorInitials(name),
    ...splitSurname(name),
    credentials: [profile.qualifications, profile.speciality]
      .filter(Boolean)
      .join(' · '),
    clinicName: profile.clinicName,
    stats: [
      {label: 'PATIENTS', value: patientCount},
      {label: 'TODAY', value: countByTab(appointments, now).today},
      {label: 'THIS WEEK', value: countThisWeek(appointments, now)},
    ],
    contact: [
      {icon: 'mail' as const, label: 'EMAIL', value: profile.email},
      {icon: 'phone' as const, label: 'PHONE', value: profile.phone},
      {
        icon: 'clock' as const,
        label: 'CLINIC HOURS',
        value: formatClinicHours(profile),
      },
    ],
    version: `v${APP_VERSION}`,
    editProfile: () => navigation.navigate('EditProfileDetails'),
    openSettings: () => navigation.navigate('Settings'),
    openAbout: () => navigation.navigate('About'),
  };
};
