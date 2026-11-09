import {format} from 'date-fns';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {patientsText} from 'src/i18n/strings/patients';
import type {DocType, RecordEntry, StoredFile} from 'src/types/clinic';

// The Upload screen's type chips; "note" = Note only.
export type EntryType = DocType | 'note';

// In the current language: call when drawing the chips.
export const entryTypes = (): {key: EntryType; label: string}[] => {
  const t = tr(patientsText);
  return [
    {key: 'prescription', label: t.typePrescription},
    {key: 'report', label: t.typeReport},
    {key: 'xray', label: t.typeXray},
    {key: 'other', label: t.typeOther},
    {key: 'note', label: t.typeNote},
  ];
};

const noun = (docType: DocType | null) => {
  const t = tr(patientsText);
  return {
    prescription: t.nounPrescription,
    report: t.nounReport,
    xray: t.nounXray,
    other: t.nounOther,
  }[docType ?? 'other'];
};

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export type EntryErrorKey = 'file' | 'note';

export const entryErrorMessage = (key: EntryErrorKey) => {
  const t = tr(patientsText);
  return key === 'file' ? t.errorFile : t.errorNote;
};

// A file is needed unless it's a note; a note is required only for "Note only".
export const entryError = (
  type: EntryType,
  file: unknown,
  note: string,
): EntryErrorKey | null => {
  if (type === 'note') {
    return note.trim() ? null : 'note';
  }
  return file ? null : 'file';
};

export const saveLabel = (type: EntryType) => {
  const t = tr(patientsText);
  return type === 'note'
    ? t.saveNote
    : t.uploadType(entryTypes().find(e => e.key === type)!.label);
};

export const uploadTitle = (docType: DocType) =>
  tr(patientsText).uploaded(noun(docType));

// "Prescription added to Amit's activity"
export const addedMessage = (entry: RecordEntry, patientName: string) => {
  const t = tr(patientsText);
  return t.addedTo(
    entry.docType ? noun(entry.docType) : t.nounNote,
    patientName.trim().split(/\s+/)[0],
  );
};

export const formatSize = (bytes: number) => {
  const t = tr(patientsText);
  return bytes < 1024 * 1024
    ? t.kb(localDigits(Math.max(1, Math.round(bytes / 1024))))
    : t.mb(localDigits((bytes / (1024 * 1024)).toFixed(1)));
};

// The little "PDF" / "JPG" / "PNG" badge on the file card.
export const fileBadge = (file: Pick<StoredFile, 'name' | 'mimeType'>) => {
  if (file.mimeType === 'application/pdf') {
    return 'PDF';
  }
  if (file.mimeType === 'image/png') {
    return 'PNG';
  }
  if (file.mimeType === 'image/jpeg') {
    return 'JPG';
  }
  return file.name.split('.').pop()?.toUpperCase().slice(0, 4) || 'FILE';
};

// Camera shots arrive as "rn_image_picker_lib_temp_….jpg"; name them like the
// design's "Rx_AmitDas_24Oct.pdf" instead: "Photo_AmitDas_24Oct.jpg".
export const photoName = (patientName: string, now: Date) =>
  `Photo_${patientName.replace(/[^A-Za-z0-9]/g, '')}_${format(
    now,
    'dMMM',
  )}.jpg`;
