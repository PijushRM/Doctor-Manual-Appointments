import {Alert, Linking} from 'react-native';
import {tr} from 'src/i18n';
import {smsText} from 'src/i18n/strings/sms';
import {showError} from 'src/utils/showError';
import {openSmsApp, sendSms} from './smsService';

const openSettings = () =>
  Linking.openSettings().catch(e => {
    const t = tr(smsText);
    showError(t.openSettingsFailed, e, t.openSettingsFallback);
  });

// Sends the appointment text from the doctor's SIM (used by "Appointment
// saved" and by the SMS button on a patient's activity). Resolves true once
// sent, or once the Messages app opened with the text filled in. On failure
// it explains why and offers Messages; `onSentLater` runs if that opens.
export const sendAppointmentSms = async (
  phone: string,
  message: string,
  onSentLater: () => void,
): Promise<boolean> => {
  const result = await sendSms(phone, message);
  if (result === 'sent' || result === 'openedApp') {
    return true;
  }
  const t = tr(smsText);
  const blocked = result === 'blocked';
  Alert.alert(
    blocked ? t.blockedTitle : t.failedTitle,
    blocked ? t.blockedBody : t.failedBody,
    [
      blocked
        ? {text: t.openSettings, onPress: openSettings}
        : {text: t.cancel, style: 'cancel'},
      {
        text: t.openMessages,
        onPress: () => {
          openSmsApp(phone, message)
            .then(onSentLater)
            .catch(e => showError(t.openMessagesFailed, e, t.noMessagesApp));
        },
      },
    ],
    {cancelable: true}, // Back or a tap outside just closes it
  );
  return false;
};
