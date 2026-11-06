import {describe, expect, it} from 'bun:test';
import {
  countByTab,
  countThisWeek,
  groupByDay,
  patientCountLabel,
} from 'src/features/appointments/dayGroups';
import {buildDemoData} from 'src/store/demoData';

// Friday 24 Oct 2025, as on the canvas.
const now = new Date(2025, 9, 24, 8, 0);
const {patients, appointments} = buildDemoData(now);
const titles = (tab: 'today' | 'upcoming' | 'all') =>
  groupByDay(appointments, patients, tab, now).map(g => g.title);

describe('countByTab', () => {
  it('matches the canvas: Today 5, Upcoming 3, All 10', () => {
    expect(countByTab(appointments, now)).toEqual({
      today: 5,
      upcoming: 3,
      all: 10,
    });
  });
});

describe('groupByDay', () => {
  it('groups today only on the Today tab, times ascending', () => {
    const [today] = groupByDay(appointments, patients, 'today', now);
    expect(titles('today')).toEqual(['TODAY, 24 OCT · 5 patients']);
    expect(today.rows.map(r => r.subtitle)).toEqual([
      '32 yrs · 9:00 AM',
      '27 yrs · 10:00 AM',
      '45 yrs · 11:30 AM',
      '38 yrs · 1:00 PM',
      '51 yrs · 4:00 PM',
    ]);
  });

  it('lists upcoming days soonest first and flags new patients', () => {
    expect(titles('upcoming')).toEqual([
      'SAT, 25 OCT · 2 patients',
      'MON, 27 OCT · 1 patient',
    ]);
    const [sat] = groupByDay(appointments, patients, 'upcoming', now);
    expect(sat.rows.map(r => [r.initials, r.isNew])).toEqual([
      ['AB', true],
      ['SM', false],
    ]);
  });

  it('puts past days last on the All tab, marked EARLIER', () => {
    expect(titles('all')).toEqual([
      'TODAY, 24 OCT · 5 patients',
      'SAT, 25 OCT · 2 patients',
      'MON, 27 OCT · 1 patient',
      'EARLIER · WED, 22 OCT · 2 patients',
    ]);
  });

  it('marks only the most recent past day EARLIER and adds other years', () => {
    const older = {
      id: 'old',
      patientId: 'demo-0',
      startsAt: new Date(2024, 11, 30, 10, 0).toISOString(),
      createdAt: '',
    };
    const all = groupByDay([...appointments, older], patients, 'all', now);
    expect(all.map(g => g.title).slice(-2)).toEqual([
      'EARLIER · WED, 22 OCT · 2 patients',
      'MON, 30 DEC 2024 · 1 patient',
    ]);
  });

  it('skips appointments whose patient is missing', () => {
    const orphan = {
      id: 'x',
      patientId: 'gone',
      startsAt: now.toISOString(),
      createdAt: '',
    };
    expect(groupByDay([orphan], patients, 'all', now)).toEqual([]);
  });
});

describe('patientCountLabel', () => {
  it('pluralises', () => {
    expect(patientCountLabel(1)).toBe('1 patient');
    expect(patientCountLabel(2)).toBe('2 patients');
  });
});

describe('countThisWeek', () => {
  it('counts Monday to Sunday of the current week', () => {
    // Fri 24 Oct 2025: Wed 22, Fri 24, Sat 25 are this week; Mon 27 is next.
    expect(countThisWeek(appointments, now)).toBe(9);
  });
});
