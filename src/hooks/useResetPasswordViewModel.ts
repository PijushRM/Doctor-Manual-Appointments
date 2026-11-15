import {useState} from 'react';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import {
  RESET_ERROR_FIELD,
  resetErrorMessage,
  type ResetError,
} from 'src/features/auth/credentials';
import {tr} from 'src/i18n';
import {resetText} from 'src/i18n/strings/auth';
import type {RootStackParamList} from 'src/navigation/types';
import {useAuthStore} from 'src/store/useAuthStore';

type Field = 'identifier' | 'code' | 'password' | 'confirm';

// Forgot password: the clinic's reset code and a new password. On success
// the doctor is logged in (the root navigator swaps to the app).
export const useResetPasswordViewModel = () => {
  const navigation = useNavigation();
  const params =
    useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>().params;
  const resetPassword = useAuthStore(s => s.resetPassword);
  const [values, setValues] = useState<Record<Field, string>>({
    identifier: params?.identifier ?? '',
    code: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<ResetError | null>(null);
  const [busy, setBusy] = useState(false);
  const t = tr(resetText);

  const submit = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    const result = await resetPassword(
      values.identifier,
      values.code,
      values.password,
      values.confirm,
    ).catch((): ResetError => 'server');
    // Success unmounts this screen; only a failure comes back here.
    if (result) {
      setError(result);
      setBusy(false);
    }
  };

  const message = error && resetErrorMessage(error);
  const errorField = error ? RESET_ERROR_FIELD[error] : undefined;
  const fieldError = (field: Field) =>
    errorField === field ? message ?? undefined : undefined;

  return {
    t,
    values,
    busy,
    showPassword,
    fieldError,
    // Errors that belong to no single field (locked, offline…).
    formError: error && !errorField ? message : null,
    setField: (field: Field) => (value: string) => {
      setValues(v => ({...v, [field]: value}));
      if (errorField === field || !errorField) {
        setError(null);
      }
    },
    toggleShowPassword: () => setShowPassword(s => !s),
    submit: () => {
      submit().catch(() => setBusy(false));
    },
    back: navigation.goBack,
  };
};
