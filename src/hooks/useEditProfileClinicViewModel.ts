import {useState} from 'react';
import {Alert} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {formatTime} from 'src/features/appointments/schedule';
import {
  parseClinic,
  type ClinicDraft,
  type ProfileErrors,
} from 'src/features/doctor/profileForm';
import type {ProfileStackParamList} from 'src/navigation/types';
import {OFFLINE_MESSAGE} from 'src/features/auth/credentials';
import {ApiError} from 'src/services/api';
import {toUpload} from 'src/services/fileService';
import {useDoctorStore} from 'src/store/useDoctorStore';

// Shown Monday first; stored Sunday first (Date#getDay order).
const DAYS = [
  {index: 1, letter: 'M', name: 'Monday'},
  {index: 2, letter: 'T', name: 'Tuesday'},
  {index: 3, letter: 'W', name: 'Wednesday'},
  {index: 4, letter: 'T', name: 'Thursday'},
  {index: 5, letter: 'F', name: 'Friday'},
  {index: 6, letter: 'S', name: 'Saturday'},
  {index: 0, letter: 'S', name: 'Sunday'},
];

type TimeKey = 'opens' | 'closes';
const TIME_TITLES: Record<TimeKey, string> = {opens: 'Opens', closes: 'Closes'};

export const useEditProfileClinicViewModel = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<ProfileStackParamList, 'EditProfileClinic'>
    >();
  const details =
    useRoute<RouteProp<ProfileStackParamList, 'EditProfileClinic'>>().params
      ?.details;
  const profile = useDoctorStore(s => s.profile);
  const saveProfile = useDoctorStore(s => s.saveProfile);

  const [draft, setDraft] = useState<ClinicDraft>(() => ({
    email: profile.email,
    phone: profile.phone,
    clinicName: profile.clinicName,
    opens: profile.opens,
    closes: profile.closes,
    workingDays: profile.workingDays,
  }));
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [editingTime, setEditingTime] = useState<TimeKey | null>(null);
  const [saving, setSaving] = useState(false);

  const change = (changes: Partial<ClinicDraft>) => {
    setDraft(d => ({...d, ...changes}));
    setErrors({});
  };

  const save = async () => {
    const {values, errors: found} = parseClinic(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      return;
    }
    setSaving(true);
    try {
      const {photo, ...personal} = details ?? {};
      const upload = photo
        ? toUpload(photo, `ProfilePhoto_${Date.now()}.jpg`)
        : undefined;
      await saveProfile({...values, ...personal}, upload);
      // From part 1 → back to Profile; from Settings › Availability → Settings.
      if (details) {
        navigation.navigate('Profile');
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert(
        'Couldn’t save your profile',
        e instanceof ApiError && !e.offline ? e.message : OFFLINE_MESSAGE,
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    fromSettings: !details,
    draft,
    errors,
    setText: (field: 'email' | 'phone' | 'clinicName') => (value: string) =>
      change({[field]: value}),
    times: (['opens', 'closes'] as TimeKey[]).map(key => ({
      key,
      label: TIME_TITLES[key],
      value: formatTime(draft[key]),
      open: () => setEditingTime(key),
    })),
    editingTime: editingTime && {
      title: TIME_TITLES[editingTime],
      minutes: draft[editingTime],
      done: (minutes: number) => {
        change({[editingTime]: minutes});
        setEditingTime(null);
      },
      close: () => setEditingTime(null),
    },
    days: DAYS.map(d => ({
      ...d,
      on: draft.workingDays[d.index],
      toggle: () =>
        change({
          workingDays: draft.workingDays.map((on, i) =>
            i === d.index ? !on : on,
          ),
        }),
    })),
    saving,
    save: () => {
      save().catch(() => setSaving(false));
    },
    back: navigation.goBack,
  };
};
