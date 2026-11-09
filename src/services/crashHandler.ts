import {Alert} from 'react-native';
import {GENERIC_MESSAGE} from 'src/utils/errors';

type Handler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsType = {
  getGlobalHandler: () => Handler;
  setGlobalHandler: (handler: Handler) => void;
};

// Errors no screen caught (e.g. thrown inside a button's handler). In a
// release build React Native would close the app; show a message instead.
// Debug builds keep the red error screen, which is more useful there.
export const installCrashHandler = () => {
  const errorUtils = (globalThis as {ErrorUtils?: ErrorUtilsType}).ErrorUtils;
  if (!errorUtils || __DEV__) {
    return;
  }
  errorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[Uncaught error]', error);
    if (isFatal) {
      Alert.alert('Something went wrong', GENERIC_MESSAGE);
    }
  });
};
