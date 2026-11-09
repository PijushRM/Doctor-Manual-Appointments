import {describe, expect, it} from 'bun:test';
import {useLanguageStore} from 'src/i18n';
import {
  formatClinicHours,
  formatWorkingDays,
} from 'src/features/doctor/clinicHours';

// Sunday first, like Date#getDay.
const days = (...open: number[]) =>
  Array.from({length: 7}, (_, d) => open.includes(d));

describe('formatWorkingDays', () => {
  it('collapses runs of three or more into a range', () => {
    expect(formatWorkingDays(days(1, 2, 3, 4, 5, 6))).toBe('Mon–Sat');
    expect(formatWorkingDays(days(1, 2, 3, 4, 5, 0))).toBe('Mon–Fri, Sun');
  });

  it('lists short runs and handles all or nothing', () => {
    expect(formatWorkingDays(days(1, 3, 5))).toBe('Mon, Wed, Fri');
    expect(formatWorkingDays(days(6, 0))).toBe('Sat, Sun');
    expect(formatWorkingDays(days(0, 1, 2, 3, 4, 5, 6))).toBe('Every day');
    expect(formatWorkingDays(days())).toBe('Closed');
  });
});

describe('formatClinicHours', () => {
  it('matches the design', () => {
    expect(
      formatClinicHours({
        workingDays: days(1, 2, 3, 4, 5, 6),
        opens: 540,
        closes: 1080,
      }),
    ).toBe('Mon–Sat · 9:00 AM – 6:00 PM');
  });
});

describe('in Bengali', () => {
  it('uses Bengali day names, digits and parts of the day', () => {
    useLanguageStore.setState({language: 'bn'});
    try {
      expect(formatWorkingDays(days(1, 2, 3, 4, 5, 6))).toBe('সোম–শনি');
      expect(formatWorkingDays(days(0, 1, 2, 3, 4, 5, 6))).toBe('প্রতিদিন');
      expect(
        formatClinicHours({
          workingDays: days(1, 2, 3, 4, 5, 6),
          opens: 540,
          closes: 1080,
        }),
      ).toBe('সোম–শনি · সকাল ৯:০০ – সন্ধ্যা ৬:০০');
    } finally {
      useLanguageStore.setState({language: 'en'});
    }
  });
});
