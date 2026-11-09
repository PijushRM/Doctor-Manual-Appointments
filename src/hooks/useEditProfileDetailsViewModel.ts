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
  takePhoto,
  type PickedFile,
} from 'src/services/fileService';
import {profilePhotoSource} from 'src/features/doctor/photo';
import {useDoctorStore} from 'src/store/useDoctorStore';

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
  // A newly picked photo; it's copied into the app only on Save.
  const [photo, setPhoto] = useState<PickedFile | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const pickPhoto = (source: 'camera' | 'library') => {
    (source === 'camera' ? takePhoto() : choosePhoto())
      .then(picked => picked && setPhoto(picked))
      .catch(() => Alert.alert('Couldn’t get the photo', 'Please try again.'));
  };

  return {
    draft,
    errors,
    photo: photo ? {uri: photo.uri} : profilePhotoSource(profile),
    initials: doctorInitials(draft.name || 'Doctor'),
    setField: (field: keyof DetailsDraft) => (value: string) => {
      setDraft(d => ({...d, [field]: value}));
      setErrors({});
    },
    changePhoto: () =>
      Alert.alert(
        'Profile photo',
        undefined,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Choose photo', onPress: () => pickPhoto('library')},
          {text: 'Take photo', onPress: () => pickPhoto('camera')},
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
