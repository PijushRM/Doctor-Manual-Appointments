import {formatTime} from 'src/features/appointments/schedule';
import {tr} from 'src/i18n';
import {commonText} from 'src/i18n/strings/common';
import {profileText} from 'src/i18n/strings/profile';

// Displayed Monday first; stored Sunday first (Date#getDay order).
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

// "Mon–Sat", "Mon–Fri, Sun", "Every day", "Closed" (or in Bengali).
export const formatWorkingDays = (workingDays: boolean[]) => {
  const t = tr(profileText);
  const SHORT = tr(commonText).weekdaysShort;
  const open = MONDAY_FIRST.filter(d => workingDays[d]);
  if (open.length === 7) {
    return t.everyDay;
  }
  if (!open.length) {
    return t.closed;
  }
  const runs: number[][] = [];
  MONDAY_FIRST.forEach((day, i) => {
    if (!workingDays[day]) {
      return;
    }
    const run = runs[runs.length - 1];
    const prev = run?.[run.length - 1];
    if (run && prev === MONDAY_FIRST[i - 1]) {
      run.push(day);
    } else {
      runs.push([day]);
    }
  });
  return runs
    .map(run =>
      run.length > 2
        ? `${SHORT[run[0]]}–${SHORT[run[run.length - 1]]}`
        : run.map(d => SHORT[d]).join(', '),
    )
    .join(', ');
};

export const formatClinicHours = (p: {
  workingDays: boolean[];
  opens: number;
  closes: number;
}) =>
  `${formatWorkingDays(p.workingDays)} · ${formatTime(p.opens)} – ${formatTime(
    p.closes,
  )}`;
