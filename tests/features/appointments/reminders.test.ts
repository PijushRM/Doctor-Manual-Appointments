import {describe, expect, it} from 'bun:test';
import {upcomingReminders} from 'src/features/appointments/reminders';
import {buildDemoData} from 'src/store/demoData';

describe('upcomingReminders', () => {
  // Fri 24 Oct 2025, 9:50 AM: the 10:00 slot's reminder (9:45) has passed.
  const now = new Date(2025, 9, 24, 9, 50);
  const {patients, appointments} = buildDemoData(new Date(2025, 9, 24, 8, 0));
  const reminders = upcomingReminders(appointments, patients, now);

  it('schedules 15 minutes before each appointment still ahead', () => {
    expect(reminders[0]).toEqual({
      id: 'demo-appt-2',
      at: new Date(2025, 9, 24, 11, 15),
      title: 'Appointment in 15 minutes',
      body: 'Amit Das · 45 yrs · 11:30 AM',
    });
  });

  it('skips past appointments and ones whose reminder time has gone', () => {
    const ids = reminders.map(r => r.id);
    expect(ids).not.toContain('demo-appt-0'); // 9:00 today
    expect(ids).not.toContain('demo-appt-1'); // 10:00 today, reminder was 9:45
    expect(ids).not.toContain('demo-appt-8'); // two days ago
    expect(ids).toHaveLength(6); // 11:30, 1 PM, 4 PM, two tomorrow, one Monday
  });
});
