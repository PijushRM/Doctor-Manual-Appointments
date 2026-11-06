import {useState} from 'react';
import {Alert} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {initials} from 'src/features/patients/patients';
import {
  ENTRY_ERRORS,
  ENTRY_TYPES,
  entryError,
  fileBadge,
  formatSize,
  photoName,
  saveLabel,
  type EntryType,
} from 'src/features/patients/recordEntry';
import type {PatientsStackParamList} from 'src/navigation/types';
import {
  chooseFile,
  keepFile,
  takePhoto,
  type PickedFile,
} from 'src/services/fileService';
import {useClinicStore} from 'src/store/useClinicStore';

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
  const [error, setError] = useState<keyof typeof ENTRY_ERRORS | null>(null);
  const [saving, setSaving] = useState(false);

  if (!patient) {
    return null;
  }
  const firstName = patient.name.split(' ')[0];
  const isNote = type === 'note';

  const addFile = async (source: 'camera' | 'files') => {
    try {
      const picked = await (source === 'camera' ? takePhoto() : chooseFile());
      if (picked) {
        setFile(picked);
        setError(null);
      }
    } catch {
      Alert.alert('Couldn’t add the file', 'Please try again.');
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
      const stored =
        !isNote && file
          ? await keepFile(
              file,
              file.fromCamera ? photoName(patient.name, new Date()) : file.name,
            )
          : null;
      const id = addEntry({
        patientId,
        docType: isNote ? null : type,
        file: stored,
        note: note.trim(),
      });
      navigation.navigate('PatientProfile', {patientId, addedEntryId: id});
    } catch {
      Alert.alert(
        'Couldn’t save the file',
        'The phone may be low on space. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    patientInitials: initials(patient.name),
    patientName: patient.name,
    types: ENTRY_TYPES.map(t => ({
      ...t,
      selected: t.key === type,
      pick: () => {
        setType(t.key);
        setError(null);
      },
    })),
    needsFile: !isNote,
    file: file && {
      badge: fileBadge(file),
      name: file.fromCamera ? photoName(patient.name, new Date()) : file.name,
      details: `${formatSize(file.size)} · ready to upload`,
    },
    fileError: error === 'file' ? ENTRY_ERRORS.file : undefined,
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
    noteHint: isNote ? 'REQUIRED' : 'OPTIONAL',
    noteError: error === 'note' ? ENTRY_ERRORS.note : undefined,
    footnote: `This will appear in ${firstName}'s activity with today's date and time.`,
    saveLabel: saveLabel(type),
    saving,
    save: () => {
      save().catch(() => setSaving(false));
    },
    back: navigation.goBack,
  };
};
