import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {patientListRows} from 'src/features/patients/activity';
import type {PatientsStackParamList} from 'src/navigation/types';
import {useClinicStore} from 'src/store/useClinicStore';
import {useNow} from './useNow';

export const usePatientListViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<PatientsStackParamList, 'PatientList'>>();
  const patients = useClinicStore(s => s.patients);
  const appointments = useClinicStore(s => s.appointments);
  const entries = useClinicStore(s => s.entries);
  const [query, setQuery] = useState('');
  const now = useNow();

  const rows = patientListRows(patients, appointments, entries, query, now);
  const total = patients.length;

  return {
    countLabel: `${total} ${total === 1 ? 'PATIENT' : 'PATIENTS'}`,
    query,
    setQuery,
    rows,
    emptyText: query.trim()
      ? `No patients match “${query.trim()}”.`
      : 'No patients yet. Add an appointment to start your list.',
    openPatient: (patientId: string) =>
      navigation.navigate('PatientProfile', {patientId}),
  };
};
