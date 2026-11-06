import {useEffect} from 'react';
import {upcomingReminders} from 'src/features/appointments/reminders';
import {syncReminders} from 'src/services/notificationService';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';

// Keeps the phone's scheduled reminders in step with the appointments and the
// Settings switch. Runs at app start and after every booking or toggle.
export const useReminderSync = () => {
  const alerts = useDoctorStore(s => s.alerts);
  const appointments = useClinicStore(s => s.appointments);
  const patients = useClinicStore(s => s.patients);

  useEffect(() => {
    const reminders = alerts
      ? upcomingReminders(appointments, patients, new Date())
      : [];
    syncReminders(reminders).catch(() => {});
  }, [alerts, appointments, patients]);
};
