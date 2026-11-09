import {useState} from 'react';
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
import {toUpload} from 'src/services/fileService';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {showError} from 'src/utils/showError';
import {tr} from 'src/i18n';
import {commonText} from 'src/i18n/strings/common';
import {profileText} from 'src/i18n/strings/profile';

// Shown Monday first; stored Sunday first (Date#getDay order).
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

type TimeKey = 'opens' | 'closes';

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
  const t = tr(profileText);
  const week = tr(commonText);
  const TIME_TITLES: Record<TimeKey, string> = {
    opens: t.opens,
    closes: t.closes,
  };

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
      showError(t.saveFailed, e);
    } finally {
      setSaving(false);
    }
  };

  return {
    t,
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
    days: MONDAY_FIRST.map(index => ({
      index,
      letter: week.weekdaysLetter[index],
      name: week.weekdaysLong[index],
      on: draft.workingDays[index],
      toggle: () =>
        change({
          workingDays: draft.workingDays.map((on, i) =>
            i === index ? !on : on,
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
