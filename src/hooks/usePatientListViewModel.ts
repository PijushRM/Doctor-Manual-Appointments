import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {patientListRows} from 'src/features/patients/activity';
import type {PatientsStackParamList} from 'src/navigation/types';
import {tr} from 'src/i18n';
import {localDigits} from 'src/i18n/format';
import {patientsText} from 'src/i18n/strings/patients';
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
  const t = tr(patientsText);

  return {
    t,
    countLabel: t.patientCount(localDigits(total), total === 1),
    query,
    setQuery,
    rows,
    emptyText: query.trim() ? t.noMatch(query.trim()) : t.noPatients,
    openPatient: (patientId: string) =>
      navigation.navigate('PatientProfile', {patientId}),
  };
};
