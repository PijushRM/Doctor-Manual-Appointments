import {
  addDays,
  format,
  getDaysInMonth,
  isSameDay,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import {tr} from 'src/i18n';
import {appointmentsText} from 'src/i18n/strings/appointments';
import type {Appointment} from 'src/types/clinic';

// Sunday first, in the current language.
export const weekdayInitials = () => tr(appointmentsText).weekdayInitials;

export const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const busyDayKeys = (appointments: Appointment[]) =>
  new Set(appointments.map(a => dayKey(new Date(a.startsAt))));

export type CalendarCell = {
  key: string;
  date: Date | null; // null = blank padding before the 1st / after the last day
  past: boolean;
  today: boolean;
  selected: boolean;
  busy: boolean;
};

const blank = (key: string): CalendarCell => ({
  key,
  date: null,
  past: false,
  today: false,
  selected: false,
  busy: false,
});

// The month as weeks of seven cells, padded with blanks at both ends.
export const monthWeeks = (
  month: Date,
  selected: Date,
  today: Date,
  busy: Set<string>,
): CalendarCell[][] => {
  const first = startOfMonth(month);
  const todayStart = startOfDay(today);
  const cells: CalendarCell[] = [];
  for (let i = 0; i < first.getDay(); i++) {
    cells.push(blank(`lead-${i}`));
  }
  for (let i = 0; i < getDaysInMonth(first); i++) {
    const date = addDays(first, i);
    cells.push({
      key: dayKey(date),
      date,
      past: date < todayStart,
      today: isSameDay(date, today),
      selected: isSameDay(date, selected),
      busy: busy.has(dayKey(date)),
    });
  }
  while (cells.length % 7) {
    cells.push(blank(`trail-${cells.length}`));
  }
  return Array.from({length: cells.length / 7}, (_, w) =>
    cells.slice(w * 7, w * 7 + 7),
  );
};

// No browsing back past the current month: past days can't be booked.
export const canGoToPreviousMonth = (month: Date, today: Date) =>
  startOfMonth(month) > startOfMonth(today);
