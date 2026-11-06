import {describe, expect, it} from 'bun:test';
import {
  addedMessage,
  entryError,
  fileBadge,
  formatSize,
  photoName,
  saveLabel,
} from 'src/features/patients/recordEntry';
import type {RecordEntry} from 'src/types/clinic';

const file = {
  uri: 'file:///x.pdf',
  name: 'Rx.pdf',
  size: 1,
  mimeType: 'application/pdf',
};

describe('entryError', () => {
  it('needs a file for uploads; the note is optional', () => {
    expect(entryError('prescription', null, 'take after food')).toBe('file');
    expect(entryError('prescription', file, '')).toBeNull();
  });

  it('needs a note for "Note only", and no file', () => {
    expect(entryError('note', null, '   ')).toBe('note');
    expect(entryError('note', null, 'Crown prep')).toBeNull();
  });
});

describe('labels', () => {
  it('matches the design’s button text', () => {
    expect(saveLabel('prescription')).toBe('Upload prescription');
    expect(saveLabel('xray')).toBe('Upload x-ray / photo');
    expect(saveLabel('note')).toBe('Save note');
  });

  it('confirms what was added, by first name', () => {
    const entry = {docType: 'prescription'} as RecordEntry;
    expect(addedMessage(entry, 'Amit Das')).toBe(
      "Prescription added to Amit's activity",
    );
    expect(addedMessage({...entry, docType: null}, 'Amit Das')).toBe(
      "Note added to Amit's activity",
    );
  });
});

describe('files', () => {
  it('formats sizes in KB, then MB', () => {
    expect(formatSize(240 * 1024)).toBe('240 KB');
    expect(formatSize(100)).toBe('1 KB');
    expect(formatSize(3.4 * 1024 * 1024)).toBe('3.4 MB');
  });

  it('badges by type, falling back to the extension', () => {
    expect(fileBadge(file)).toBe('PDF');
    expect(fileBadge({name: 'a.jpeg', mimeType: 'image/jpeg'})).toBe('JPG');
    expect(fileBadge({name: 'scan.heic', mimeType: ''})).toBe('HEIC');
  });

  it('names camera photos after the patient and day', () => {
    expect(photoName('Amit Das', new Date(2025, 9, 24))).toBe(
      'Photo_AmitDas_24Oct.jpg',
    );
  });
});
