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
import {MAX_UPLOAD_BYTES} from 'src/configs/upload';
import {
  ACCEPTED_MIME_TYPES,
  formatSize,
} from 'src/features/patients/recordEntry';
import {api} from 'src/services/api';
import type {StoredFile} from 'src/types/clinic';
import {AppError} from 'src/utils/errors';

// Picked but not yet kept: `uri` is temporary (camera cache or content://).
export type PickedFile = StoredFile & {fromCamera: boolean};

// Every upload (record files, profile photo) is picked through this file, so
// the MAX_UPLOAD_MB limit from .env is checked here, as soon as it's picked.
export class FileTooLargeError extends AppError {
  constructor(readonly size: number) {
    super(
      `Files must be ${formatSize(MAX_UPLOAD_BYTES)} or smaller. ` +
        `This one is ${formatSize(size)}.`,
    );
  }
}

const withinLimit = <T extends StoredFile>(file: T): T => {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new FileTooLargeError(file.size);
  }
  return file;
};

const PHOTO_ERRORS: Record<
  NonNullable<ImagePickerResponse['errorCode']>,
  string
> = {
  camera_unavailable: 'The camera isn’t available on this phone right now.',
  permission:
    'Smile Doctor isn’t allowed to use the camera or photos. Allow it in Settings › Apps › Smile Doctor.',
  others: 'Couldn’t get the photo. Please try again.',
};

// Photos are scaled down first so a normal camera shot fits the limit.
const PHOTO_OPTIONS = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1600,
} as const;

const firstPhoto = (
  result: ImagePickerResponse,
  fromCamera: boolean,
): PickedFile | null => {
  if (result.errorCode) {
    throw new AppError(PHOTO_ERRORS[result.errorCode]);
  }
  const photo = result.assets?.[0];
  if (result.didCancel || !photo?.uri) {
    return null;
  }
  return withinLimit({
    uri: photo.uri,
    name: photo.fileName ?? 'photo.jpg',
    size: photo.fileSize ?? 0,
    mimeType: photo.type ?? 'image/jpeg',
    fromCamera,
  });
};

// Opens the system camera app (no CAMERA permission needed). null = cancelled.
export const takePhoto = async () =>
  firstPhoto(await launchCamera(PHOTO_OPTIONS), true);

// Android's photo picker (no storage permission needed). null = cancelled.
export const choosePhoto = async () =>
  firstPhoto(
    await launchImageLibrary({...PHOTO_OPTIONS, selectionLimit: 1}),
    false,
  );

// PDF, JPG or PNG from the phone or Drive. null = cancelled.
export const chooseFile = async (): Promise<PickedFile | null> => {
  try {
    const [file] = await pick({type: ACCEPTED_MIME_TYPES});
    return withinLimit({
      uri: file.uri,
      name: file.name ?? 'file',
      size: file.size ?? 0,
      mimeType: file.type ?? '',
      fromCamera: false,
    });
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    if (e instanceof AppError) {
      throw e; // too large
    }
    throw new AppError(
      isErrorWithCode(e) && e.code === errorCodes.UNABLE_TO_OPEN_FILE_TYPE
        ? 'This kind of file can’t be added. Choose a PDF, JPG or PNG.'
        : 'Couldn’t get the file. Please try again.',
    );
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
    throw new AppError('This file isn’t on the server.');
  }
  const url = await api.fileLink(file.fileId); // ApiError: already readable
  try {
    await Linking.openURL(url);
  } catch {
    throw new AppError(
      'No app on this phone can open it. Install a PDF or photo viewer and try again.',
    );
  }
};
