import {useState} from 'react';
import {Alert} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {
  parsePatientDraft,
  type DraftErrors,
  type PatientDraft,
} from 'src/features/patients/patientDraft';
import {tr} from 'src/i18n';
import {patientActionsText} from 'src/i18n/strings/patientActions';
import type {PatientsStackParamList} from 'src/navigation/types';
import {ApiError} from 'src/services/api';
import {useClinicStore} from 'src/store/useClinicStore';
import {showError} from 'src/utils/showError';

type Route = RouteProp<PatientsStackParamList, 'EditPatient'>;

// Edit a patient's name, age, phone and email; or delete the patient.
export const useEditPatientViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<PatientsStackParamList, 'EditPatient'>>();
  const {patientId} = useRoute<Route>().params;
  const patient = useClinicStore(s => s.patients.find(p => p.id === patientId));
  const updatePatient = useClinicStore(s => s.updatePatient);
  const deletePatient = useClinicStore(s => s.deletePatient);
  const [draft, setDraft] = useState<PatientDraft>(() => ({
    name: patient?.name ?? '',
    age: patient ? String(patient.age) : '',
    phone: patient?.phone ?? '',
    email: patient?.email ?? '',
  }));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);
  const t = tr(patientActionsText);

  const save = async () => {
    const {patient: parsed, errors: found} = parsePatientDraft(draft);
    setErrors(found);
    if (!parsed || !patient || busy) {
      return;
    }
    // Only what changed, so an untouched form saves nothing.
    const changes = Object.fromEntries(
      (Object.keys(parsed) as (keyof typeof parsed)[])
        .filter(key => parsed[key] !== patient[key])
        .map(key => [key, parsed[key]]),
    );
    if (!Object.keys(changes).length) {
      navigation.goBack();
      return;
    }
    setBusy('saving');
    try {
      await updatePatient(patientId, changes);
      navigation.goBack();
    } catch (e) {
      // A field the server rejected (e.g. name + phone already used) shows
      // under that field; anything else as a pop-up.
      const field =
        e instanceof ApiError && e.details && Object.keys(e.details)[0];
      if (field && field in draft) {
        setErrors({[field]: e.message} as DraftErrors);
      } else {
        showError(t.saveFailed, e);
      }
    } finally {
      setBusy(null);
    }
  };

  const remove = () =>
    Alert.alert(
      t.deleteTitle(patient?.name ?? ''),
      t.deleteBody,
      [
        {text: t.cancel, style: 'cancel'},
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            setBusy('deleting');
            try {
              await deletePatient(patientId);
              // Their profile is gone too: back to the list.
              navigation.popToTop();
            } catch (e) {
              setBusy(null);
              showError(t.deleteFailed, e);
            }
          },
        },
      ],
      {cancelable: true},
    );

  return {
    t,
    // Deleted or gone after a refresh: the screen leaves.
    gone: !patient && busy !== 'deleting',
    draft,
    errors,
    busy,
    setField: (field: keyof PatientDraft) => (value: string) => {
      setDraft(d => ({...d, [field]: value}));
      setErrors(({[field]: _, ...rest}) => rest);
    },
    save: () => {
      save().catch(e => showError(t.saveFailed, e));
    },
    remove,
    back: navigation.goBack,
  };
};
