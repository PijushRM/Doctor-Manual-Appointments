import {useEffect} from 'react';
import {upcomingReminders} from 'src/features/appointments/reminders';
import {useLanguage} from 'src/i18n';
import {syncReminders} from 'src/services/notificationService';
import {useAuthStore} from 'src/store/useAuthStore';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {useSyncStore} from 'src/store/sync';
import {logger} from 'src/utils/logger';

// Keeps the phone's scheduled reminders in step with the appointments and the
// Settings switch. Runs after each load from the server, booking or toggle.
export const useReminderSync = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  // Nothing is saved on the phone, so until the server answers the lists are
  // empty: that must not cancel reminders (e.g. opening the app offline).
  const loaded = useSyncStore(s => s.status === 'ready');
  const alerts = useDoctorStore(s => s.alerts);
  const appointments = useClinicStore(s => s.appointments);
  const patients = useClinicStore(s => s.patients);
  // Reminder text is in the app language: re-schedule when it changes.
  const language = useLanguage();

  useEffect(() => {
    if (isLoggedIn && !loaded) {
      return;
    }
    // Logged out or alerts off: cancel them all (they carry patient names).
    const reminders =
      isLoggedIn && alerts
        ? upcomingReminders(appointments, patients, new Date())
        : [];
    // Runs in the background, so there's no one to show an alert to; logged.
    syncReminders(reminders).catch(e =>
      logger.warn('reminders', 'Couldn’t update reminders', e),
    );
  }, [isLoggedIn, loaded, alerts, appointments, patients, language]);
};
