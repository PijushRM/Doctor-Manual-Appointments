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
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {filesText} from 'src/i18n/strings/files';
import {AppError} from 'src/utils/errors';

// Picked but not yet kept: `uri` is temporary (camera cache or content://).
export type PickedFile = StoredFile & {fromCamera: boolean};

// Every upload (record files, profile photo) is picked through this file, so
// the MAX_UPLOAD_MB limit from .env is checked here, as soon as it's picked.
export class FileTooLargeError extends AppError {
  constructor(readonly size: number) {
    super(
      tr(filesText).tooLarge(
        localDigits(formatSize(MAX_UPLOAD_BYTES)),
        localDigits(formatSize(size)),
      ),
    );
  }
}

const withinLimit = <T extends StoredFile>(file: T): T => {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new FileTooLargeError(file.size);
  }
  return file;
};

const photoError = (
  code: NonNullable<ImagePickerResponse['errorCode']>,
): string => {
  const t = tr(filesText);
  return {
    camera_unavailable: t.cameraUnavailable,
    permission: t.photoPermission,
    others: t.photoFailed,
  }[code];
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
    throw new AppError(photoError(result.errorCode));
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
        ? tr(filesText).wrongType
        : tr(filesText).fileFailed,
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
    throw new AppError(tr(filesText).notOnServer);
  }
  const url = await api.fileLink(file.fileId); // ApiError: already readable
  try {
    await Linking.openURL(url);
  } catch {
    throw new AppError(tr(filesText).noViewer);
  }
};
