import {NativeModules, PermissionsAndroid, type Permission} from 'react-native';
import {MMKV} from 'src/configs/storage';

// android/app/src/main/java/com/smiledental/doctor/permissions/PermissionsModule.kt
const {PermissionsHelper} = NativeModules as {
  PermissionsHelper: {
    shouldShowRationale: (permission: string) => Promise<boolean>;
  };
};

const {GRANTED, NEVER_ASK_AGAIN} = PermissionsAndroid.RESULTS;

export type PermissionState = 'granted' | 'denied' | 'blocked';

// React Native hands back a permission result only on the app's next resume.
// When no dialog appears (already granted, or denied twice so Android refuses
// silently), no resume follows and request() never settles. So never ask when
// already granted, and spot "blocked" first: asked before, and Android no
// longer wants to explain.
export const requestPermission = async (
  permission: Permission,
): Promise<PermissionState> => {
  if (await PermissionsAndroid.check(permission)) {
    return 'granted';
  }
  const askedKey = `permissionAsked:${permission}`;
  if (
    MMKV.getBool(askedKey) &&
    !(await PermissionsHelper.shouldShowRationale(permission))
  ) {
    return 'blocked';
  }
  MMKV.setBool(askedKey, true);
  const result = await PermissionsAndroid.request(permission);
  if (result === GRANTED) {
    return 'granted';
  }
  return result === NEVER_ASK_AGAIN ? 'blocked' : 'denied';
};
