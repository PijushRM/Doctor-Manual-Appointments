import {useState} from 'react';
import {Alert} from 'react-native';
import {
  FORGOT_PASSWORD_MESSAGE,
  LOGIN_ERROR_MESSAGES,
} from 'src/features/auth/credentials';
import {useAuthStore} from 'src/store/useAuthStore';

type Mode = 'login' | 'register';

export const useLoginViewModel = () => {
  const logIn = useAuthStore(s => s.logIn);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const result = await logIn(identifier, password, mode);
      // On success the root navigator swaps to the app and this screen unmounts.
      if (result) {
        setError(LOGIN_ERROR_MESSAGES[result]);
        setBusy(false);
      }
    } catch {
      setError(LOGIN_ERROR_MESSAGES.server);
      setBusy(false);
    }
  };

  const isRegister = mode === 'register';
  return {
    identifier,
    password,
    showPassword,
    error,
    busy,
    isRegister,
    title: isRegister ? 'Create account' : 'Log in',
    buttonTitle: busy
      ? isRegister
        ? 'Creating account…'
        : 'Logging in…'
      : isRegister
      ? 'Create account'
      : 'Log in',
    switchModeLabel: isRegister
      ? 'Already have an account? Log in'
      : 'New here? Create an account',
    switchMode: () => {
      setMode(m => (m === 'login' ? 'register' : 'login'));
      setError(null);
    },
    setIdentifier: (value: string) => {
      setIdentifier(value);
      setError(null);
    },
    setPassword: (value: string) => {
      setPassword(value);
      setError(null);
    },
    toggleShowPassword: () => setShowPassword(v => !v),
    submit: () => {
      submit().catch(() => setBusy(false));
    },
    forgotPassword: () =>
      Alert.alert('Forgot password?', FORGOT_PASSWORD_MESSAGE),
  };
};
