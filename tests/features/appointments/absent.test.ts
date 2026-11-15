import {describe, expect, it} from 'bun:test';
import {busyDayKeys} from 'src/features/appointments/calendar';
import {countByTab} from 'src/features/appointments/dayGroups';
import {upcomingReminders} from 'src/features/appointments/reminders';
import {bookedMinutes, clashes} from 'src/features/appointments/schedule';
import {nextVisit, patientEvents} from 'src/features/patients/activity';
import type {Appointment, Patient} from 'src/types/clinic';

const now = new Date(2025, 9, 24, 9, 0);
const at = (h: number) => new Date(2025, 9, 24, h, 0).toISOString();
const patient: Patient = {
  id: 'p1',
  name: 'Amit Das',
  age: 34,
  phone: '9830012345',
  email: '',
  createdAt: '2025-10-01T00:00:00.000Z',
};
const appt = (id: string, h: number, status?: 'absent'): Appointment => ({
  id,
  patientId: 'p1',
  startsAt: at(h),
  createdAt: '2025-10-20T00:00:00.000Z',
  ...(status && {status}),
});

describe('an absent appointment frees its slot', () => {
  const list = [appt('a', 11, 'absent'), appt('b', 15)];

  it('no longer counts as booked or clashes', () => {
    expect(bookedMinutes(list, now)).toEqual([15 * 60]);
    expect(clashes(bookedMinutes(list, now), 11 * 60)).toBe(false);
  });

  it('drops out of reminders, counts, busy days and next visit', () => {
    expect(upcomingReminders(list, [patient], now).map(r => r.id)).toEqual([
      'b',
    ]);
    expect(countByTab(list, now).today).toBe(1);
    expect(busyDayKeys([appt('a', 11, 'absent')]).size).toBe(0);
    expect(nextVisit([appt('a', 11, 'absent')], now)).toBeUndefined();
  });
});

describe('absent in the patient’s activity', () => {
  it('shows "Absent" (undo-able) instead of a visit', () => {
    const later = new Date(2025, 9, 24, 18, 0);
    const events = patientEvents(patient, [appt('a', 11, 'absent')], [], later);
    const absent = events.find(e => e.kind === 'absent');
    expect(absent?.attendance).toEqual({appointmentId: 'a', absent: true});
    expect(events.some(e => e.kind === 'visit')).toBe(false);
  });

  it('lets a visit or an upcoming booking be marked absent', () => {
    const events = patientEvents(
      patient,
      [appt('past', 8), appt('ahead', 15)],
      [],
      now,
    );
    const visit = events.find(e => e.key === 'past-visit');
    const ahead = events.find(e => e.key === 'ahead-booked');
    expect(visit?.attendance).toEqual({appointmentId: 'past', absent: false});
    expect(ahead?.attendance).toEqual({appointmentId: 'ahead', absent: false});
    expect(ahead?.appointmentId).toBe('ahead'); // SMS + change time too
  });
});
