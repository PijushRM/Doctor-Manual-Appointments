import {differenceInCalendarDays, isSameYear} from 'date-fns';
import {formatTime, minutesOfDay} from 'src/features/appointments/schedule';
import {tr} from 'src/i18n';
import {formatDate} from 'src/i18n/format';
import {patientsText} from 'src/i18n/strings/patients';
import type {ServerPatient} from 'src/services/api';
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

export type ActivityKind =
  | 'added'
  | 'booked'
  | 'visit'
  | 'absent'
  | 'upload'
  | 'note';
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
  // An appointment row that can be marked absent (or, if absent, undone).
  attendance?: {appointmentId: string; absent: boolean};
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
export const patientEvents = (
  patient: Patient,
  appointments: Appointment[],
  entries: RecordEntry[],
  now: Date,
): ActivityEvent[] => {
  const t = tr(patientsText);
  const events: ActivityEvent[] = entries.map(entryEvent);
  // Every booking is its own row, including the one made when the patient
  // was added, so each can be moved, texted or marked absent.
  for (const a of appointments) {
    const startsAt = new Date(a.startsAt);
    const absent = a.status === 'absent';
    events.push({
      key: `${a.id}-booked`,
      kind: 'booked',
      at: new Date(a.createdAt),
      title: t.appointmentBooked,
      summary: `${t.appointmentBooked} · ${appointmentDay(startsAt)}`,
      detail: appointmentDayTime(startsAt),
      // Still ahead and expected: SMS, change time, or mark absent.
      appointmentId: startsAt > now && !absent ? a.id : undefined,
      attendance:
        startsAt > now && !absent
          ? {appointmentId: a.id, absent: false}
          : undefined,
    });
    if (absent) {
      // Didn't come: shown at the appointment time, can be undone.
      events.push({
        key: `${a.id}-absent`,
        kind: 'absent',
        at: startsAt,
        title: t.absent,
        summary: t.absent,
        detail: appointmentDayTime(startsAt),
        attendance: {appointmentId: a.id, absent: true},
      });
    } else if (startsAt <= now) {
      events.push({
        key: `${a.id}-visit`,
        kind: 'visit',
        at: startsAt,
        title: t.visit,
        summary: t.visit,
        // Recorded as a visit until the doctor says the patient didn't come.
        attendance: {appointmentId: a.id, absent: false},
      });
    }
  }
  // When the patient was added: a record only, no actions. With a booking
  // made at the same moment, that booking sorts just above it.
  events.push({
    key: `${patient.id}-added`,
    kind: 'added',
    at: new Date(patient.createdAt),
    title: t.addedByYou,
    summary: t.addedByYou,
  });
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

// A Patients list row built from the server's denormalized `lastActivity`, so
// the paginated list needs only the patient (not their appointments and
// records). Produces the same line and time as patientListRows would for that
// patient's most recent *action* (added / booked / upload / note).
export const patientRowFromServer = (
  patient: ServerPatient,
  now: Date,
): PatientListRow => {
  const t = tr(patientsText);
  const a = patient.lastActivity;
  const at = a ? new Date(a.at) : new Date(patient.createdAt);
  let activity: string;
  if (!a || a.kind === 'added') {
    activity = t.addedByYou;
  } else if (a.kind === 'booked') {
    activity = `${t.appointmentBooked} · ${appointmentDay(new Date(a.startsAt ?? at))}`;
  } else {
    const title =
      a.kind === 'upload' && a.docType ? uploadTitle(a.docType) : t.noteAdded;
    activity = a.note ? `${title} · ${a.note}` : title;
  }
  return {
    id: patient.id,
    initials: initials(patient.name),
    name: patient.name,
    age: patient.age,
    activity,
    when: formatWhen(at, now),
  };
};

// The earliest appointment still ahead, if any.
export const nextVisit = (appointments: Appointment[], now: Date) =>
  appointments
    .filter(a => a.status !== 'absent')
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
