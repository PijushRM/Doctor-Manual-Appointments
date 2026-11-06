import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {format} from 'date-fns';
import {
  appointmentDayTime,
  formatWhen,
  nextVisit,
  patientEvents,
} from 'src/features/patients/activity';
import {initials, splitSurname} from 'src/features/patients/patients';
import {addedMessage} from 'src/features/patients/recordEntry';
import type {PatientsStackParamList} from 'src/navigation/types';
import {openFile} from 'src/services/fileService';
import {useClinicStore} from 'src/store/useClinicStore';
import type {StoredFile} from 'src/types/clinic';
import {useNow} from './useNow';

type Route = RouteProp<PatientsStackParamList, 'PatientProfile'>;

export const usePatientProfileViewModel = () => {
  const navigation =
    useNavigation<
      StackNavigationProp<PatientsStackParamList, 'PatientProfile'>
    >();
  const {patientId, addedEntryId} = useRoute<Route>().params;
  const patient = useClinicStore(s => s.patients.find(p => p.id === patientId));
  const allAppointments = useClinicStore(s => s.appointments);
  const allEntries = useClinicStore(s => s.entries);
  const now = useNow();

  // The banner and "New" tag last until the doctor leaves the profile. Kept as
  // local state: clearing the route param would fail once the screen is popped.
  const [dismissedId, setDismissedId] = useState<string>();
  useFocusEffect(
    useCallback(() => () => setDismissedId(addedEntryId), [addedEntryId]),
  );
  const freshId = addedEntryId !== dismissedId ? addedEntryId : undefined;

  if (!patient) {
    return null;
  }

  const appointments = allAppointments.filter(a => a.patientId === patientId);
  const entries = allEntries.filter(e => e.patientId === patientId);
  const added = entries.find(e => e.id === freshId);
  const next = nextVisit(appointments, now);

  return {
    initials: initials(patient.name),
    // The design colours the surname: "Amit [Das]".
    ...splitSurname(patient.name),
    // Gender isn't collected on New Appointment, so it's left out here.
    facts: `${patient.age} YRS · PATIENT SINCE ${format(
      new Date(patient.createdAt),
      'MMM yyyy',
    ).toUpperCase()}`,
    phone: patient.phone,
    email: patient.email,
    nextVisit: next ? appointmentDayTime(next) : 'None booked',
    addedBanner: added && addedMessage(added, patient.name),
    events: patientEvents(patient, appointments, entries, now).map(e => ({
      ...e,
      when: e.key === freshId ? 'Just now' : formatWhen(e.at, now),
      isNew: e.key === freshId,
    })),
    open: (file: StoredFile) =>
      openFile(file).catch(() =>
        Alert.alert(
          'Can’t open this file',
          'No app on this phone can open it. Install a PDF or photo viewer and try again.',
        ),
      ),
    back: navigation.goBack,
    upload: () =>
      navigation.navigate('UploadNote', {patientId, mode: 'upload'}),
    addNote: () => navigation.navigate('UploadNote', {patientId, mode: 'note'}),
  };
};
