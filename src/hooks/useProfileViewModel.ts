import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {APP_VERSION} from 'src/constants/app';
import {formatClinicHours} from 'src/features/doctor/clinicHours';
import {doctorInitials, splitSurname} from 'src/features/patients/patients';
import type {ProfileStackParamList} from 'src/navigation/types';
import {profilePhotoSource} from 'src/features/doctor/photo';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {profileText} from 'src/i18n/strings/profile';
import {useCounts} from './useCounts';

export const useProfileViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'Profile'>>();
  const profile = useDoctorStore(s => s.profile);
  const counts = useCounts();
  const t = tr(profileText);

  const name = profile.name || t.doctorFallback;

  return {
    t,
    photo: profilePhotoSource(profile),
    initials: doctorInitials(name),
    ...splitSurname(name),
    credentials: [profile.qualifications, profile.speciality]
      .filter(Boolean)
      .join(' · '),
    clinicName: profile.clinicName,
    stats: [
      {label: t.statPatients, value: counts?.patients ?? 0},
      {label: t.statToday, value: counts?.today ?? 0},
      {label: t.statThisWeek, value: counts?.thisWeek ?? 0},
    ],
    contact: [
      {icon: 'mail' as const, label: t.email, value: profile.email},
      {icon: 'phone' as const, label: t.phone, value: profile.phone},
      {
        icon: 'clock' as const,
        label: t.clinicHours,
        value: formatClinicHours(profile),
      },
    ],
    version: `v${localDigits(APP_VERSION)}`,
    editProfile: () => navigation.navigate('EditProfileDetails'),
    openSettings: () => navigation.navigate('Settings'),
    openAbout: () => navigation.navigate('About'),
  };
};
