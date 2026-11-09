import {describe, expect, it} from 'bun:test';
import {format} from 'date-fns';
import {
  DATE_STRIP_DAYS,
  DEFAULT_CLINIC_HOURS,
} from 'src/constants/appointments';
import {
  atMinutes,
  bookedMinutes,
  clashes,
  dateStrip,
  formatTime,
  freeSoon,
  initialSlot,
  joinTime,
  splitTime,
} from 'src/features/appointments/schedule';
import type {Appointment} from 'src/types/clinic';

const hours = DEFAULT_CLINIC_HOURS; // 9 AM – 6 PM
const at = (date: Date, hhmm: string): Appointment => {
  const [h, m] = hhmm.split(':').map(Number);
  return {
    id: hhmm,
    patientId: 'p',
    startsAt: atMinutes(date, h * 60 + m).toISOString(),
    createdAt: '',
  };
};
// The canvas's Friday 24 Oct 2025 bookings: 9:00, 10:00, 11:30, 1:00 PM, 4:00 PM.
const fri = new Date(2025, 9, 24);
const friBookings = ['09:00', '10:00', '11:30', '13:00', '16:00'].map(t =>
  at(fri, t),
);

describe('time parts', () => {
  it('round-trips 12-hour parts, including midnight and noon', () => {
    for (const minutes of [0, 59, 60, 719, 720, 750, 1439]) {
      expect(joinTime(splitTime(minutes))).toBe(minutes);
    }
    expect(splitTime(0)).toEqual({h12: 12, m: 0, pm: false});
    expect(splitTime(720)).toEqual({h12: 12, m: 0, pm: true});
  });

  it('formats like the design', () => {
    expect(formatTime(630)).toBe('10:30 AM');
    expect(formatTime(780)).toBe('1:00 PM');
    expect(formatTime(5)).toBe('12:05 AM');
  });
});

describe('bookings', () => {
  const booked = bookedMinutes(friBookings, fri);

  it('collects one day’s bookings in order', () => {
    expect(booked).toEqual([540, 600, 690, 780, 960]);
    expect(bookedMinutes(friBookings, new Date(2025, 9, 25))).toEqual([]);
  });

  it('flags times within 30 minutes of a booking', () => {
    expect(clashes(booked, 615)).toBe(true); // 10:15 vs 10:00
    expect(clashes(booked, 630)).toBe(false); // 10:30 is exactly 30 away
  });

  it('suggests the next free quarter-hours after the selected time', () => {
    // Selected 10:30 → 10:45, 11:00, then 11:15–11:45 clash with 11:30.
    expect(freeSoon(booked, 630, hours).map(formatTime)).toEqual([
      '10:45 AM',
      '11:00 AM',
      '12:00 PM',
    ]);
  });

  it('keeps suggestions inside clinic hours', () => {
    expect(freeSoon([], 6 * 60, hours, 1)).toEqual([9 * 60]);
    expect(freeSoon([], 17 * 60 + 40, hours)).toEqual([17 * 60 + 45]);
  });
});

describe('dateStrip', () => {
  const day = (d: Date) => format(d, 'd MMM');

  it('is a fixed run of days from today that doesn’t move with the selection', () => {
    const a = dateStrip(fri, fri);
    const b = dateStrip(new Date(2025, 9, 30), fri);
    expect(a).toHaveLength(DATE_STRIP_DAYS);
    expect(day(a[0])).toBe('24 Oct');
    expect(b.map(day)).toEqual(a.map(day));
  });

  it('extends to a day picked further out on the calendar', () => {
    const far = new Date(2026, 5, 1);
    const strip = dateStrip(far, fri);
    expect(day(strip[0])).toBe('24 Oct');
    expect(day(strip.at(-1)!)).toBe('1 Jun');
  });
});

describe('initialSlot', () => {
  const day = (d: Date) => format(d, 'd MMM');

  it('picks the first free slot after now today', () => {
    const now = new Date(2025, 9, 24, 10, 20);
    const slot = initialSlot(friBookings, now, hours);
    expect(day(slot.day)).toBe('24 Oct');
    expect(formatTime(slot.minutes)).toBe('10:30 AM');
  });

  it('skips days the clinic is closed', () => {
    const monToSat = [false, true, true, true, true, true, true];
    // Saturday evening → Sunday is closed → Monday 9:00.
    const slot = initialSlot([], new Date(2025, 9, 25, 19, 0), hours, monToSat);
    expect(day(slot.day)).toBe('27 Oct');
    expect(formatTime(slot.minutes)).toBe('9:00 AM');
  });

  it('rolls to tomorrow’s opening once the day is over', () => {
    const slot = initialSlot(friBookings, new Date(2025, 9, 24, 19, 0), hours);
    expect(day(slot.day)).toBe('25 Oct');
    expect(formatTime(slot.minutes)).toBe('9:00 AM');
  });
});
