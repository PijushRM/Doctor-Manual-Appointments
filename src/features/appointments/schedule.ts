import {
  addDays,
  differenceInCalendarDays,
  isSameDay,
  startOfDay,
} from 'date-fns';
import {
  CLASH_WINDOW_MINUTES,
  DATE_STRIP_DAYS,
  QUICK_PICK_COUNT,
  QUICK_PICK_STEP_MINUTES,
  type ClinicHours,
} from 'src/constants/appointments';
import type {Appointment} from 'src/types/clinic';
import {clockTime} from 'src/i18n/format';

// Times are minutes from midnight (0–1439); days are Dates at local midnight.
export type TimeParts = {h12: number; m: number; pm: boolean};

export const splitTime = (minutes: number): TimeParts => {
  const h24 = Math.floor(minutes / 60);
  return {h12: h24 % 12 || 12, m: minutes % 60, pm: h24 >= 12};
};

export const joinTime = ({h12, m, pm}: TimeParts) =>
  ((h12 % 12) + (pm ? 12 : 0)) * 60 + m;

// "10:30 AM", or "সকাল ১০:৩০" in Bengali.
export const formatTime = (minutes: number) => clockTime(minutes);

export const minutesOfDay = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

export const atMinutes = (day: Date, minutes: number) => {
  const date = startOfDay(day);
  date.setMinutes(minutes);
  return date;
};

// Wheel columns loop: hours 1–12, minutes 0–59.
export const wrap = (value: number, count: number, start: number) =>
  ((((value - start) % count) + count) % count) + start;

export const bookedMinutes = (appointments: Appointment[], day: Date) =>
  appointments
    .map(a => new Date(a.startsAt))
    .filter(date => isSameDay(date, day))
    .map(minutesOfDay)
    .sort((a, b) => a - b);

export const clashes = (booked: number[], minutes: number) =>
  booked.some(b => Math.abs(b - minutes) < CLASH_WINDOW_MINUTES);

// The next open quarter-hours strictly after `after`, inside clinic hours.
export const freeSoon = (
  booked: number[],
  after: number,
  hours: ClinicHours,
  count = QUICK_PICK_COUNT,
) => {
  const step = QUICK_PICK_STEP_MINUTES;
  const free: number[] = [];
  let t = Math.max(hours.opens, Math.floor(after / step) * step + step);
  for (; free.length < count && t < hours.closes; t += step) {
    if (!clashes(booked, t)) {
      free.push(t);
    }
  }
  return free;
};

// Seven pills starting the day before the selection, never before today.
// The scrollable date row: a fixed run of days from today, so picking a day
// doesn't shift the row. A day picked further out on the calendar extends it.
export const dateStrip = (selected: Date, today: Date) => {
  const start = startOfDay(selected < today ? selected : today);
  const needed = differenceInCalendarDays(selected, start) + 1;
  return Array.from({length: Math.max(DATE_STRIP_DAYS, needed)}, (_, i) =>
    addDays(start, i),
  );
};

export const ALL_DAYS = [true, true, true, true, true, true, true];

// Where the form starts: the first free slot from now, on a working day
// (Sunday-first flags, like Date#getDay), looking up to a week ahead.
export const initialSlot = (
  appointments: Appointment[],
  now: Date,
  hours: ClinicHours,
  workingDays: boolean[] = ALL_DAYS,
) => {
  const today = startOfDay(now);
  for (let offset = 0; offset <= 7; offset++) {
    const day = addDays(today, offset);
    if (!workingDays[day.getDay()]) {
      continue;
    }
    const after = offset === 0 ? minutesOfDay(now) : hours.opens - 1;
    const [free] = freeSoon(bookedMinutes(appointments, day), after, hours, 1);
    if (free !== undefined) {
      return {day, minutes: free};
    }
  }
  return {day: addDays(today, 1), minutes: hours.opens};
};
