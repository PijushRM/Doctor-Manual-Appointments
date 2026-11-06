import {PermissionsAndroid, Platform} from 'react-native';
import notifee, {
  AlarmType,
  AndroidImportance,
  TriggerType,
} from '@notifee/react-native';
import type {Reminder} from 'src/features/appointments/reminders';
import {requestPermission} from './permissions';

const CHANNEL_ID = 'appointment-reminders';

// Android 13+ asks the doctor; older versions allow it outright. (Not
// notifee.requestPermission: it waits for a resume that may never come.)
export const requestAlertPermission = async () =>
  Number(Platform.Version) < 33 ||
  (await requestPermission(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  )) === 'granted';

// Replaces every scheduled reminder with `reminders` (empty = alerts off).
// ponytail: reschedules all on each change; fine for a clinic's upcoming list,
// diff by id if it ever runs into Android's ~500-alarm limit.
export const syncReminders = async (reminders: Reminder[]) => {
  await notifee.cancelTriggerNotifications();
  if (!reminders.length) {
    return;
  }
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Appointment reminders',
    importance: AndroidImportance.HIGH,
  });
  for (const r of reminders) {
    await notifee.createTriggerNotification(
      {
        id: r.id,
        title: r.title,
        body: r.body,
        android: {channelId: CHANNEL_ID, pressAction: {id: 'default'}},
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: r.at.getTime(),
        // Exact, even in Doze. (Inexact alarms were measured slipping by up
        // to an hour.) USE_EXACT_ALARM in the manifest grants this silently.
        alarmManager: {type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE},
      },
    );
  }
};
