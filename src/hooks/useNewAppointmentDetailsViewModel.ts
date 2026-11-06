import {useState} from 'react';
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {StackNavigationProp} from '@react-navigation/stack';
import {
  EMPTY_DRAFT,
  findExistingPatient,
  parsePatientDraft,
  type DraftErrors,
  type PatientDraft,
} from 'src/features/patients/patientDraft';
import type {
  AppointmentsStackParamList,
  MainTabParamList,
} from 'src/navigation/types';
import {useClinicStore} from 'src/store/useClinicStore';

type Navigation = CompositeNavigationProp<
  StackNavigationProp<AppointmentsStackParamList, 'NewAppointmentDetails'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export const useNewAppointmentDetailsViewModel = () => {
  const navigation = useNavigation<Navigation>();
  const patients = useClinicStore(s => s.patients);
  const [draft, setDraft] = useState<PatientDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});

  const existing = findExistingPatient(patients, draft);

  return {
    draft,
    errors,
    existingName: existing?.name,
    setField: (field: keyof PatientDraft) => (value: string) => {
      setDraft(d => ({...d, [field]: value}));
      setErrors(({[field]: _, ...rest}) => rest);
    },
    back: () => navigation.navigate('HomeTab', {screen: 'MyPatients'}),
    next: () => {
      const {patient, errors: found} = parsePatientDraft(draft);
      setErrors(found);
      if (patient) {
        navigation.navigate('NewAppointmentDateTime', {patient});
      }
    },
  };
};
