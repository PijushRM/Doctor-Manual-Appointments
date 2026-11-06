import {Linking, NativeModules, PermissionsAndroid} from 'react-native';
import {smsNumber} from 'src/features/appointments/message';
import {requestPermission} from './permissions';

// android/app/src/main/java/com/smiledental/doctor/sms/SmsModule.kt
const {SmsSender} = NativeModules as {
  SmsSender: {send: (phone: string, message: string) => Promise<void>};
};

// blocked = the doctor denied twice, so Android no longer asks.
export type SmsResult = 'sent' | 'openedApp' | 'blocked' | 'failed';

export const openSmsApp = (phone: string, message: string) =>
  Linking.openURL(
    `sms:${smsNumber(phone)}?body=${encodeURIComponent(message)}`,
  );

// Sends from the doctor's own SIM. Without the permission, opens the
// Messages app with the text filled in so the doctor can send it by hand.
export const sendSms = async (
  phone: string,
  message: string,
): Promise<SmsResult> => {
  // No custom rationale: React Native's rationale dialog continues to the
  // system prompt whichever button is pressed, so its "Not now" would mislead.
  const permission = await requestPermission(
    PermissionsAndroid.PERMISSIONS.SEND_SMS,
  );
  if (permission === 'blocked') {
    return 'blocked';
  }
  if (permission === 'denied') {
    await openSmsApp(phone, message);
    return 'openedApp';
  }
  try {
    await SmsSender.send(smsNumber(phone), message);
    return 'sent';
  } catch {
    return 'failed';
  }
};
