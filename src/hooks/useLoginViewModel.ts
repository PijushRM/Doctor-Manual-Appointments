import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {loginErrorMessage} from 'src/features/auth/credentials';
import type {RootStackParamList} from 'src/navigation/types';
import {tr} from 'src/i18n';
import {loginText} from 'src/i18n/strings/auth';
import {useAuthStore} from 'src/store/useAuthStore';

type Mode = 'login' | 'register';

export const useLoginViewModel = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'Login'>>();
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
        setError(loginErrorMessage(result));
        setBusy(false);
      }
    } catch {
      setError(loginErrorMessage('server'));
      setBusy(false);
    }
  };

  const isRegister = mode === 'register';
  const t = tr(loginText);
  return {
    t,
    identifier,
    password,
    showPassword,
    error,
    busy,
    isRegister,
    title: isRegister ? t.createAccount : t.logIn,
    buttonTitle: busy
      ? isRegister
        ? t.creatingAccount
        : t.loggingIn
      : isRegister
      ? t.createAccount
      : t.logIn,
    switchModeLabel: isRegister ? t.haveAccount : t.newHere,
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
    // The email/ID already typed here carries over.
    forgotPassword: () =>
      navigation.navigate('ResetPassword', {identifier: identifier.trim()}),
  };
};
