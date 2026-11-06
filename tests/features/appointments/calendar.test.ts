import {describe, expect, it} from 'bun:test';
import {
  busyDayKeys,
  canGoToPreviousMonth,
  monthWeeks,
} from 'src/features/appointments/calendar';

// The canvas: today Fri 24 Oct 2025, Sat 25 selected, bookings on 24, 25, 27 Oct and 3 Nov.
const today = new Date(2025, 9, 24, 15, 0);
const selected = new Date(2025, 9, 25);
const busy = busyDayKeys(
  [
    '2025-10-24T09:00',
    '2025-10-25T12:00',
    '2025-10-27T09:30',
    '2025-11-03T10:00',
  ].map((t, i) => ({
    id: `${i}`,
    patientId: 'p',
    startsAt: new Date(t).toISOString(),
    createdAt: '',
  })),
);
const weeks = monthWeeks(new Date(2025, 9, 1), selected, today, busy);
const cell = (day: number) =>
  weeks.flat().find(c => c.date?.getDate() === day)!;

describe('monthWeeks', () => {
  it('starts on the right weekday and pads to whole weeks', () => {
    expect(weeks).toHaveLength(5);
    expect(weeks.every(w => w.length === 7)).toBe(true);
    expect(weeks[0].slice(0, 3).every(c => c.date === null)).toBe(true); // 1 Oct 2025 is a Wednesday
    expect(weeks[0][3].date?.getDate()).toBe(1);
    expect(weeks[4].map(c => c.date?.getDate() ?? null)).toEqual([
      26,
      27,
      28,
      29,
      30,
      31,
      null,
    ]);
  });

  it('greys days before today but not today itself', () => {
    expect(cell(23).past).toBe(true);
    expect(cell(24)).toMatchObject({past: false, today: true});
  });

  it('marks the selection and days with bookings', () => {
    expect(cell(25)).toMatchObject({selected: true, busy: true});
    expect(cell(27).busy).toBe(true);
    expect(cell(26).busy).toBe(false);
  });
});

describe('canGoToPreviousMonth', () => {
  it('stops at the current month', () => {
    expect(canGoToPreviousMonth(new Date(2025, 9, 1), today)).toBe(false);
    expect(canGoToPreviousMonth(new Date(2025, 10, 1), today)).toBe(true);
  });
});
