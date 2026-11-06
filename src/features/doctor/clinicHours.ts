import {formatTime} from 'src/features/appointments/schedule';

// Displayed Monday first; stored Sunday first (Date#getDay order).
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "Mon–Sat", "Mon–Fri, Sun", "Every day", "Closed".
export const formatWorkingDays = (workingDays: boolean[]) => {
  const open = MONDAY_FIRST.filter(d => workingDays[d]);
  if (open.length === 7) {
    return 'Every day';
  }
  if (!open.length) {
    return 'Closed';
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
