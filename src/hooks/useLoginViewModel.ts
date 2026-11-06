import {useState} from 'react';
import {Alert} from 'react-native';
import {
  FORGOT_PASSWORD_MESSAGE,
  LOGIN_ERROR_MESSAGES,
} from 'src/features/auth/credentials';
import {useAuthStore} from 'src/store/useAuthStore';

export const useLoginViewModel = () => {
  const logIn = useAuthStore(s => s.logIn);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    identifier,
    password,
    showPassword,
    error,
    setIdentifier: (value: string) => {
      setIdentifier(value);
      setError(null);
    },
    setPassword: (value: string) => {
      setPassword(value);
      setError(null);
    },
    toggleShowPassword: () => setShowPassword(v => !v),
    // On success the root navigator swaps to the app; nothing to navigate here.
    submit: () => {
      const result = logIn(identifier, password);
      setError(result && LOGIN_ERROR_MESSAGES[result]);
    },
    forgotPassword: () =>
      Alert.alert('Forgot password?', FORGOT_PASSWORD_MESSAGE),
  };
};
