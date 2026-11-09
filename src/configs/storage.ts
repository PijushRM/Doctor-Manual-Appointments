import {MMKVInstance, MMKVLoader} from 'react-native-mmkv-storage';
import {createJSONStorage, type StateStorage} from 'zustand/middleware';

export const MMKV = new MMKVLoader().initialize();

// Patients, appointments, records and the profile come from the server and
// are never saved on the phone. Older versions cached them under these keys.
['clinic', 'doctor'].forEach(key => MMKV.removeItem(key));

// Encrypted instance for credentials; the key lives in the Android Keystore.
const SECURE_MMKV = new MMKVLoader()
  .withInstanceID('smile-doctor-secure')
  .withEncryption()
  .initialize();

// Synchronous (unlike the reference app's async wrapper) so persisted stores
// hydrate before the first render: no flash of the login screen.
const toStateStorage = (instance: MMKVInstance): StateStorage => ({
  getItem: key => instance.getString(key) ?? null,
  setItem: (key, value) => {
    instance.setString(key, value);
  },
  removeItem: key => {
    instance.removeItem(key);
  },
});

export const zustandStorage = createJSONStorage(() => toStateStorage(MMKV));
export const zustandSecureStorage = createJSONStorage(() =>
  toStateStorage(SECURE_MMKV),
);
