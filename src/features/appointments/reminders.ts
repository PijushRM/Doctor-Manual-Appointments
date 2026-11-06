import {formatTime, minutesOfDay} from './schedule';
import type {Appointment, Patient} from 'src/types/clinic';

export const REMINDER_LEAD_MINUTES = 15;

export type Reminder = {id: string; at: Date; title: string; body: string};

// One reminder per appointment, 15 minutes before it, for those still ahead.
export const upcomingReminders = (
  appointments: Appointment[],
  patients: Patient[],
  now: Date,
): Reminder[] => {
  const byId = new Map(patients.map(p => [p.id, p]));
  return appointments.flatMap(a => {
    const startsAt = new Date(a.startsAt);
    const at = new Date(startsAt.getTime() - REMINDER_LEAD_MINUTES * 60_000);
    const patient = byId.get(a.patientId);
    if (!patient || at <= now) {
      return [];
    }
    return [
      {
        id: a.id,
        at,
        title: `Appointment in ${REMINDER_LEAD_MINUTES} minutes`,
        body: `${patient.name} · ${patient.age} yrs · ${formatTime(
          minutesOfDay(startsAt),
        )}`,
      },
    ];
  });
};
