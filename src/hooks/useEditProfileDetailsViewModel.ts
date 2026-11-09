import {useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {
  parseDetails,
  type DetailsDraft,
  type ProfileErrors,
} from 'src/features/doctor/profileForm';
import {doctorInitials} from 'src/features/patients/patients';
import type {ProfileStackParamList} from 'src/navigation/types';
import {
  choosePhoto,
  FileTooLargeError,
  takePhoto,
  type PickedFile,
} from 'src/services/fileService';
import {profilePhotoSource} from 'src/features/doctor/photo';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {showError} from 'src/utils/showError';
import {tr} from 'src/i18n';
import {profileText} from 'src/i18n/strings/profile';

export const useEditProfileDetailsViewModel = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<ProfileStackParamList, 'EditProfileDetails'>
    >();
  const profile = useDoctorStore(s => s.profile);
  const [draft, setDraft] = useState<DetailsDraft>(() => ({
    name: profile.name,
    qualifications: profile.qualifications,
    speciality: profile.speciality,
  }));
  // A newly picked photo; it's uploaded only on Save.
  const [photo, setPhoto] = useState<PickedFile | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const t = tr(profileText);

  const pickPhoto = (source: 'camera' | 'library') => {
    (source === 'camera' ? takePhoto() : choosePhoto())
      .then(picked => picked && setPhoto(picked))
      .catch(e =>
        showError(
          e instanceof FileTooLargeError ? t.photoTooLarge : t.photoFailed,
          e,
        ),
      );
  };

  return {
    t,
    draft,
    errors,
    photo: photo ? {uri: photo.uri} : profilePhotoSource(profile),
    initials: doctorInitials(draft.name || t.doctorFallback),
    setField: (field: keyof DetailsDraft) => (value: string) => {
      setDraft(d => ({...d, [field]: value}));
      setErrors({});
    },
    changePhoto: () =>
      Alert.alert(
        t.profilePhoto,
        undefined,
        [
          {text: t.cancel, style: 'cancel'},
          {text: t.choosePhoto, onPress: () => pickPhoto('library')},
          {text: t.takePhoto, onPress: () => pickPhoto('camera')},
        ],
        {cancelable: true},
      ),
    back: navigation.goBack,
    next: () => {
      const {values, errors: found} = parseDetails(draft);
      setErrors(found);
      if (!found.name) {
        navigation.navigate('EditProfileClinic', {
          details: {...values, photo: photo ?? undefined},
        });
      }
    },
  };
};
