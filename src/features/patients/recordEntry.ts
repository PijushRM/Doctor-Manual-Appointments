import {format} from 'date-fns';
import type {DocType, RecordEntry, StoredFile} from 'src/types/clinic';

// The Upload screen's type chips; "note" = Note only.
export type EntryType = DocType | 'note';

export const ENTRY_TYPES: {key: EntryType; label: string}[] = [
  {key: 'prescription', label: 'Prescription'},
  {key: 'report', label: 'Report'},
  {key: 'xray', label: 'X-ray / Photo'},
  {key: 'other', label: 'Other'},
  {key: 'note', label: 'Note only'},
];

const NOUN: Record<DocType, string> = {
  prescription: 'Prescription',
  report: 'Report',
  xray: 'X-ray / photo',
  other: 'File',
};

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export const ENTRY_ERRORS = {
  file: 'Add a photo or file first.',
  note: 'Write the note first.',
};

// A file is needed unless it's a note; a note is required only for "Note only".
export const entryError = (
  type: EntryType,
  file: unknown,
  note: string,
): keyof typeof ENTRY_ERRORS | null => {
  if (type === 'note') {
    return note.trim() ? null : 'note';
  }
  return file ? null : 'file';
};

export const saveLabel = (type: EntryType) =>
  type === 'note'
    ? 'Save note'
    : `Upload ${ENTRY_TYPES.find(t => t.key === type)!.label.toLowerCase()}`;

export const uploadTitle = (docType: DocType) => `${NOUN[docType]} uploaded`;

// "Prescription added to Amit's activity"
export const addedMessage = (entry: RecordEntry, patientName: string) =>
  `${entry.docType ? NOUN[entry.docType] : 'Note'} added to ${
    patientName.trim().split(/\s+/)[0]
  }'s activity`;

export const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

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
