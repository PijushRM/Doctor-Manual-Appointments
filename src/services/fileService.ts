import {
  errorCodes,
  isErrorWithCode,
  pick,
} from '@react-native-documents/picker';
import {Linking} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import {ACCEPTED_MIME_TYPES} from 'src/features/patients/recordEntry';
import {api} from 'src/services/api';
import type {StoredFile} from 'src/types/clinic';

// Picked but not yet kept: `uri` is temporary (camera cache or content://).
export type PickedFile = StoredFile & {fromCamera: boolean};

const firstPhoto = (
  result: ImagePickerResponse,
  fromCamera: boolean,
): PickedFile | null => {
  if (result.errorCode) {
    throw new Error(result.errorMessage ?? result.errorCode);
  }
  const photo = result.assets?.[0];
  if (result.didCancel || !photo?.uri) {
    return null;
  }
  return {
    uri: photo.uri,
    name: photo.fileName ?? 'photo.jpg',
    size: photo.fileSize ?? 0,
    mimeType: photo.type ?? 'image/jpeg',
    fromCamera,
  };
};

// Opens the system camera app (no CAMERA permission needed). null = cancelled.
export const takePhoto = async () =>
  firstPhoto(await launchCamera({mediaType: 'photo', quality: 0.8}), true);

// Android's photo picker (no storage permission needed). null = cancelled.
export const choosePhoto = async () =>
  firstPhoto(
    await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    }),
    false,
  );

// PDF, JPG or PNG from the phone or Drive. null = cancelled.
export const chooseFile = async (): Promise<PickedFile | null> => {
  try {
    const [file] = await pick({type: ACCEPTED_MIME_TYPES});
    return {
      uri: file.uri,
      name: file.name ?? 'file',
      size: file.size ?? 0,
      mimeType: file.type ?? '',
      fromCamera: false,
    };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw e;
  }
};

// Ready to upload under `name`. Nothing is copied onto the phone: the picked
// file is sent to the server straight from where the picker left it.
export const toUpload = (
  {fromCamera: _, ...file}: PickedFile,
  name: string,
): StoredFile => ({...file, name});

// Hands the file to whichever app opens it (PDF viewer, Photos…), from the
// server via a 5-minute link. Nothing is downloaded into this app.
export const openFile = async (file: StoredFile) => {
  if (!file.fileId) {
    throw new Error('File is not on the server');
  }
  return Linking.openURL(await api.fileLink(file.fileId));
};
