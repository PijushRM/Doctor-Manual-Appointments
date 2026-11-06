import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
} from '@react-native-documents/picker';
import {viewDocument} from '@react-native-documents/viewer';
import {LogBox} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import {ACCEPTED_MIME_TYPES} from 'src/features/patients/recordEntry';
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

// Camera and gallery results are file:// copies in this app's own cache, so
// their access can't lapse the way a borrowed content:// uri can; the
// picker's "wasn't picked with this module" warning doesn't apply to them.
LogBox.ignoreLogs(["keepLocalCopy: You're trying to copy a file"]);

// Copies into the app's documents folder (its own random subfolder), so the
// record outlives cache clears and the picker's temporary access.
export const keepFile = async (
  {fromCamera: _, ...file}: PickedFile,
  name: string,
): Promise<StoredFile> => {
  const [copy] = await keepLocalCopy({
    files: [{uri: file.uri, fileName: name}],
    destination: 'documentDirectory',
  });
  if (copy.status !== 'success') {
    throw new Error(copy.copyError);
  }
  return {...file, name, uri: copy.localUri};
};

// Hands the file to whichever app opens it (PDF viewer, Photos…).
export const openFile = (file: StoredFile) =>
  viewDocument({
    uri: file.uri,
    mimeType: file.mimeType,
    grantPermissions: 'read',
  });
