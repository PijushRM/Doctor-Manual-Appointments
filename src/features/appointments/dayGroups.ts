import {format, isSameWeek, isSameYear, startOfDay} from 'date-fns';
import {initials, isNewPatient} from 'src/features/patients/patients';
import type {Appointment, Patient} from 'src/types/clinic';

export type HomeTab = 'today' | 'upcoming' | 'all';
type When = 'today' | 'upcoming' | 'past';

export type AppointmentRow = {
  appointmentId: string;
  patientId: string;
  initials: string;
  name: string;
  subtitle: string; // "32 yrs · 9:00 AM"
  isNew: boolean;
};

export type DayGroup = {key: string; title: string; rows: AppointmentRow[]};

const whenOf = (date: Date, now: Date): When => {
  const diff = startOfDay(date).getTime() - startOfDay(now).getTime();
  if (diff === 0) {
    return 'today';
  }
  return diff > 0 ? 'upcoming' : 'past';
};

export const countByTab = (
  appointments: Appointment[],
  now: Date,
): Record<HomeTab, number> => {
  const counts = {today: 0, upcoming: 0, all: appointments.length};
  for (const appointment of appointments) {
    const when = whenOf(new Date(appointment.startsAt), now);
    if (when !== 'past') {
      counts[when]++;
    }
  }
  return counts;
};

// Appointments in the current Monday–Sunday week (Profile's "This week").
export const countThisWeek = (appointments: Appointment[], now: Date) =>
  appointments.filter(a =>
    isSameWeek(new Date(a.startsAt), now, {weekStartsOn: 1}),
  ).length;

export const patientCountLabel = (count: number) =>
  `${count} ${count === 1 ? 'patient' : 'patients'}`;

const dayLabel = (date: Date, when: When, now: Date) => {
  if (when === 'today') {
    return `TODAY, ${format(date, 'd MMM')}`.toUpperCase();
  }
  const pattern = isSameYear(date, now) ? 'EEE, d MMM' : 'EEE, d MMM yyyy';
  return format(date, pattern).toUpperCase();
};

// Today first, then upcoming days soonest first, then past days latest first
// (the first one prefixed "EARLIER"). Times ascend within a day.
// ponytail: the All tab renders every past appointment; window it if lists get long.
export const groupByDay = (
  appointments: Appointment[],
  patients: Patient[],
  tab: HomeTab,
  now: Date,
): DayGroup[] => {
  const patientsById = new Map(patients.map(p => [p.id, p]));
  const days = new Map<
    string,
    {date: Date; when: When; rows: AppointmentRow[]}
  >();

  const sorted = appointments
    .map(appointment => ({appointment, date: new Date(appointment.startsAt)}))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const {appointment, date} of sorted) {
    const patient = patientsById.get(appointment.patientId);
    const when = whenOf(date, now);
    if (!patient || (tab !== 'all' && when !== tab)) {
      continue;
    }
    const key = format(date, 'yyyy-MM-dd');
    const day = days.get(key) ?? {date, when, rows: []};
    day.rows.push({
      appointmentId: appointment.id,
      patientId: patient.id,
      initials: initials(patient.name),
      name: patient.name,
      subtitle: `${patient.age} yrs · ${format(date, 'h:mm a')}`,
      isNew: isNewPatient(patient, now),
    });
    days.set(key, day);
  }

  const list = [...days.entries()];
  const past = list.filter(([, d]) => d.when === 'past').reverse();
  const ordered = [...list.filter(([, d]) => d.when !== 'past'), ...past];

  return ordered.map(([key, day]) => {
    const prefix = past[0]?.[0] === key ? 'EARLIER · ' : '';
    return {
      key,
      title: `${prefix}${dayLabel(
        day.date,
        day.when,
        now,
      )} · ${patientCountLabel(day.rows.length)}`,
      rows: day.rows,
    };
  });
};
