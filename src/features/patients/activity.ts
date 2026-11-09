import {differenceInCalendarDays, isSameYear} from 'date-fns';
import {formatTime, minutesOfDay} from 'src/features/appointments/schedule';
import {tr} from 'src/i18n';
import {formatDate} from 'src/i18n/format';
import {patientsText} from 'src/i18n/strings/patients';
import type {
  Appointment,
  DocType,
  Patient,
  RecordEntry,
  StoredFile,
} from 'src/types/clinic';
import {phoneDigits} from './patientDraft';
import {initials} from './patients';
import {formatSize, uploadTitle} from './recordEntry';

export type ActivityKind = 'added' | 'booked' | 'visit' | 'upload' | 'note';
export type ActivityEvent = {
  key: string;
  kind: ActivityKind;
  at: Date;
  title: string; // profile timeline: "Appointment booked"
  summary: string; // Patients list: "Appointment booked · Mon, 27 Oct"
  detail?: string; // profile timeline, second line: "Mon, 27 Oct · 11:00 AM"
  note?: string; // shown in a box under the event
  file?: StoredFile; // tap to open
  docType?: DocType;
  // A booking whose visit is still ahead: its row offers "Send SMS", in case
  // the patient wasn't told when it was booked.
  appointmentId?: string;
};

const appointmentDay = (date: Date) => formatDate(date, 'EEE, d MMM');
export const appointmentDayTime = (date: Date) =>
  `${appointmentDay(date)} · ${formatTime(minutesOfDay(date))}`;

const entryEvent = (entry: RecordEntry): ActivityEvent => {
  const title = entry.docType
    ? uploadTitle(entry.docType)
    : tr(patientsText).noteAdded;
  return {
    key: entry.id,
    kind: entry.docType ? 'upload' : 'note',
    at: new Date(entry.at),
    title,
    summary: entry.note ? `${title} · ${entry.note}` : title,
    detail: entry.file
      ? `${entry.file.name} · ${formatSize(entry.file.size)}`
      : undefined,
    note: entry.note || undefined,
    file: entry.file ?? undefined,
    docType: entry.docType ?? undefined,
  };
};

// One patient's history, newest first: uploads and notes, plus bookings and
// visits. A booking counts when it was made; the booking that first added the
// patient reads "Added by you". Once an appointment's time has passed it also
// counts as a visit.
// ponytail: no attendance tracking, so a no-show still reads as a visit.
const ADDED_WITH_BOOKING_MS = 10_000;

export const patientEvents = (
  patient: Patient,
  appointments: Appointment[],
  entries: RecordEntry[],
  now: Date,
): ActivityEvent[] => {
  const t = tr(patientsText);
  const events: ActivityEvent[] = entries.map(entryEvent);
  // The booking that added the patient: the server creates the patient and
  // then the appointment, a moment apart, so match within a few seconds.
  const patientAt = new Date(patient.createdAt).getTime();
  const addingBooking = appointments
    .filter(
      a =>
        Math.abs(new Date(a.createdAt).getTime() - patientAt) <=
        ADDED_WITH_BOOKING_MS,
    )
    .sort(
      (x, y) =>
        new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
    )[0]?.id;
  let addedWithBooking = false;
  for (const a of appointments) {
    const startsAt = new Date(a.startsAt);
    const isFirst = a.id === addingBooking;
    addedWithBooking ||= isFirst;
    const title = isFirst ? t.addedByYou : t.appointmentBooked;
    events.push({
      key: `${a.id}-booked`,
      kind: isFirst ? 'added' : 'booked',
      at: new Date(a.createdAt),
      title,
      summary: `${title} · ${appointmentDay(startsAt)}`,
      detail: `${isFirst ? t.bookedFor : ''}${appointmentDayTime(startsAt)}`,
      appointmentId: startsAt > now ? a.id : undefined,
    });
    if (startsAt <= now) {
      events.push({
        key: `${a.id}-visit`,
        kind: 'visit',
        at: startsAt,
        title: t.visit,
        summary: t.visit,
      });
    }
  }
  if (!addedWithBooking) {
    events.push({
      key: `${patient.id}-added`,
      kind: 'added',
      at: new Date(patient.createdAt),
      title: t.addedByYou,
      summary: t.addedByYou,
    });
  }
  return events.sort((x, y) => y.at.getTime() - x.at.getTime());
};

// "9:15 AM" today, "Yesterday", "22 Oct", or "22 Oct 2024".
export const formatWhen = (at: Date, now: Date) => {
  const daysAgo = differenceInCalendarDays(now, at);
  if (daysAgo === 0) {
    return formatTime(minutesOfDay(at));
  }
  if (daysAgo === 1) {
    return tr(patientsText).yesterday;
  }
  return formatDate(at, isSameYear(at, now) ? 'd MMM' : 'd MMM yyyy');
};

// Name contains the text, or the phone contains the digits typed.
export const matchesSearch = (patient: Patient, query: string) => {
  const text = query.trim().toLowerCase();
  if (!text) {
    return true;
  }
  const digits = phoneDigits(text);
  return (
    patient.name.toLowerCase().includes(text) ||
    (digits.length > 0 && phoneDigits(patient.phone).includes(digits))
  );
};

export type PatientListRow = {
  id: string;
  initials: string;
  name: string;
  age: number;
  activity: string;
  when: string;
};

// The earliest appointment still ahead, if any.
export const nextVisit = (appointments: Appointment[], now: Date) =>
  appointments
    .map(a => new Date(a.startsAt))
    .filter(date => date > now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

// The Patients tab: search, then most recent activity first.
const groupByPatient = <T extends {patientId: string}>(items: T[]) => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    map.set(item.patientId, [...(map.get(item.patientId) ?? []), item]);
  }
  return map;
};

export const patientListRows = (
  patients: Patient[],
  appointments: Appointment[],
  entries: RecordEntry[],
  query: string,
  now: Date,
): PatientListRow[] => {
  const appointmentsBy = groupByPatient(appointments);
  const entriesBy = groupByPatient(entries);
  return patients
    .filter(p => matchesSearch(p, query))
    .map(p => {
      const [latest] = patientEvents(
        p,
        appointmentsBy.get(p.id) ?? [],
        entriesBy.get(p.id) ?? [],
        now,
      );
      return {latest, row: p};
    })
    .sort((a, b) => b.latest.at.getTime() - a.latest.at.getTime())
    .map(({latest, row}) => ({
      id: row.id,
      initials: initials(row.name),
      name: row.name,
      age: row.age,
      activity: latest.summary,
      when: formatWhen(latest.at, now),
    }));
};
