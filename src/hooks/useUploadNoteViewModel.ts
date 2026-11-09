import {useState} from 'react';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {initials} from 'src/features/patients/patients';
import {
  entryError,
  entryErrorMessage,
  entryTypes,
  fileBadge,
  formatSize,
  photoName,
  saveLabel,
  type EntryErrorKey,
  type EntryType,
} from 'src/features/patients/recordEntry';
import type {PatientsStackParamList} from 'src/navigation/types';
import {
  chooseFile,
  FileTooLargeError,
  toUpload,
  takePhoto,
  type PickedFile,
} from 'src/services/fileService';
import {tr} from 'src/i18n';
import {patientsText} from 'src/i18n/strings/patients';
import {useClinicStore} from 'src/store/useClinicStore';
import {showError} from 'src/utils/showError';

type Route = RouteProp<PatientsStackParamList, 'UploadNote'>;

export const useUploadNoteViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<PatientsStackParamList, 'UploadNote'>>();
  const {patientId, mode} = useRoute<Route>().params;
  const patient = useClinicStore(s => s.patients.find(p => p.id === patientId));
  const addEntry = useClinicStore(s => s.addEntry);

  const [type, setType] = useState<EntryType>(
    mode === 'note' ? 'note' : 'prescription',
  );
  const [file, setFile] = useState<PickedFile | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<EntryErrorKey | null>(null);
  const [saving, setSaving] = useState(false);

  if (!patient) {
    return null;
  }
  const firstName = patient.name.split(' ')[0];
  const isNote = type === 'note';
  const t = tr(patientsText);

  const addFile = async (source: 'camera' | 'files') => {
    try {
      const picked = await (source === 'camera' ? takePhoto() : chooseFile());
      if (picked) {
        setFile(picked);
        setError(null);
      }
    } catch (e) {
      showError(
        e instanceof FileTooLargeError ? t.fileTooLarge : t.addFileFailed,
        e,
      );
    }
  };

  const save = async () => {
    const problem = entryError(type, file, note);
    setError(problem);
    if (problem) {
      return;
    }
    setSaving(true);
    try {
      // A file picked before switching to "Note only" is dropped.
      const upload =
        !isNote && file
          ? toUpload(
              file,
              file.fromCamera ? photoName(patient.name, new Date()) : file.name,
            )
          : null;
      const id = await addEntry({
        patientId,
        docType: isNote ? null : type,
        file: upload,
        note: note.trim(),
      });
      navigation.navigate('PatientProfile', {patientId, addedEntryId: id});
    } catch (e) {
      showError(isNote ? t.saveNoteFailed : t.saveFileFailed, e);
    } finally {
      setSaving(false);
    }
  };

  return {
    t,
    patientInitials: initials(patient.name),
    patientName: patient.name,
    types: entryTypes().map(entry => ({
      ...entry,
      selected: entry.key === type,
      pick: () => {
        setType(entry.key);
        setError(null);
      },
    })),
    needsFile: !isNote,
    file: file && {
      badge: fileBadge(file),
      name: file.fromCamera ? photoName(patient.name, new Date()) : file.name,
      details: t.readyToUpload(formatSize(file.size)),
    },
    fileError: error === 'file' ? entryErrorMessage('file') : undefined,
    removeFile: () => setFile(null),
    takePhoto: () => {
      addFile('camera').catch(() => {});
    },
    chooseFile: () => {
      addFile('files').catch(() => {});
    },
    note,
    setNote: (text: string) => {
      setNote(text);
      setError(null);
    },
    noteHint: isNote ? t.required : t.optional,
    noteError: error === 'note' ? entryErrorMessage('note') : undefined,
    footnote: t.footnote(firstName),
    saveLabel: saveLabel(type),
    saving,
    save: () => {
      save().catch(() => setSaving(false));
    },
    back: navigation.goBack,
  };
};
