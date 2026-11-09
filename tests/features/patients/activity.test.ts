import {describe, expect, it} from 'bun:test';
import {
  formatWhen,
  matchesSearch,
  nextVisit,
  patientEvents,
  patientListRows,
} from 'src/features/patients/activity';
import type {Appointment, Patient, RecordEntry} from 'src/types/clinic';

const now = new Date(2025, 9, 24, 12, 0); // Fri 24 Oct 2025, noon
const iso = (d: number, h = 9, m = 0) =>
  new Date(2025, 9, d, h, m).toISOString();

const amit: Patient = {
  id: 'amit',
  name: 'Amit Das',
  age: 45,
  phone: '+91 98300 11111',
  email: '',
  createdAt: iso(1),
};
const appt = (
  id: string,
  startsAt: string,
  createdAt: string,
): Appointment => ({
  id,
  patientId: 'amit',
  startsAt,
  createdAt,
});

describe('patientEvents', () => {
  it('lists bookings and past visits, newest first', () => {
    const events = patientEvents(
      amit,
      [
        appt('first', iso(10, 11, 30), iso(1)), // the booking that added Amit
        appt('next', iso(27, 9, 30), iso(24, 9, 15)), // booked this morning, still ahead
      ],
      [],
      now,
    );
    expect(events.map(e => [e.kind, e.summary, e.detail])).toEqual([
      ['booked', 'Appointment booked · Mon, 27 Oct', 'Mon, 27 Oct · 9:30 AM'],
      ['visit', 'Visit', undefined],
      [
        'added',
        'Added by you · Fri, 10 Oct',
        'Booked for Fri, 10 Oct · 11:30 AM',
      ],
    ]);
  });

  it('shows one "Added by you" row when the server created patient and booking a moment apart', () => {
    const patient = {...amit, createdAt: '2025-10-20T04:00:00.000Z'};
    const events = patientEvents(
      patient,
      [
        {
          id: 'a1',
          patientId: patient.id,
          startsAt: iso(27, 9, 30),
          createdAt: '2025-10-20T04:00:00.120Z', // 120 ms after the patient
        },
      ],
      [],
      now,
    );
    expect(events.map(e => e.kind)).toEqual(['added']);
    expect(events[0].detail).toStartWith('Booked for');
  });

  it('offers SMS only on bookings whose visit is still ahead', () => {
    const events = patientEvents(
      amit,
      [
        appt('first', iso(10, 11, 30), iso(1)), // visit already happened
        appt('next', iso(27, 9, 30), iso(24, 9, 15)), // still ahead
      ],
      [],
      now,
    );
    expect(events.map(e => [e.kind, e.appointmentId])).toEqual([
      ['booked', 'next'],
      ['visit', undefined],
      ['added', undefined],
    ]);
  });

  it('falls back to "Added by you" for a patient with no bookings', () => {
    expect(patientEvents(amit, [], [], now).map(e => e.title)).toEqual([
      'Added by you',
    ]);
  });
});

describe('record entries', () => {
  const rx: RecordEntry = {
    id: 'rx',
    patientId: 'amit',
    at: iso(24, 11, 50),
    docType: 'prescription',
    file: {
      uri: 'file:///rx.pdf',
      name: 'Rx_AmitDas_24Oct.pdf',
      size: 240 * 1024,
      mimeType: 'application/pdf',
    },
    note: 'Amoxicillin 500 mg',
  };
  const note: RecordEntry = {
    ...rx,
    id: 'n',
    at: iso(22, 18),
    docType: null,
    file: null,
    note: 'Crown prep',
  };

  it('joins the timeline with file details and the note', () => {
    const [first, second] = patientEvents(amit, [], [note, rx], now);
    expect(first).toMatchObject({
      kind: 'upload',
      title: 'Prescription uploaded',
      detail: 'Rx_AmitDas_24Oct.pdf · 240 KB',
      note: 'Amoxicillin 500 mg',
      file: rx.file,
    });
    expect(second).toMatchObject({kind: 'note', title: 'Note added'});
  });

  it('shows on the Patients list with the note as context', () => {
    expect(patientListRows([amit], [], [note], '', now)[0].activity).toBe(
      'Note added · Crown prep',
    );
  });
});

describe('nextVisit', () => {
  it('is the soonest appointment still ahead', () => {
    const appointments = [
      appt('past', iso(20), iso(1)),
      appt('later', iso(30), iso(1)),
      appt('soon', iso(27, 11), iso(1)),
    ];
    expect(nextVisit(appointments, now)).toEqual(new Date(2025, 9, 27, 11, 0));
    expect(nextVisit([appointments[0]], now)).toBeUndefined();
  });
});

describe('formatWhen', () => {
  it('reads like the design', () => {
    expect(formatWhen(new Date(2025, 9, 24, 9, 15), now)).toBe('9:15 AM');
    expect(formatWhen(new Date(2025, 9, 23, 18, 0), now)).toBe('Yesterday');
    expect(formatWhen(new Date(2025, 9, 22, 18, 0), now)).toBe('22 Oct');
    expect(formatWhen(new Date(2024, 11, 30), now)).toBe('30 Dec 2024');
  });
});

describe('matchesSearch', () => {
  it('matches part of the name or the phone digits', () => {
    expect(matchesSearch(amit, '')).toBe(true);
    expect(matchesSearch(amit, ' das')).toBe(true);
    expect(matchesSearch(amit, '98300 111')).toBe(true);
    expect(matchesSearch(amit, 'priya')).toBe(false);
    expect(matchesSearch(amit, '777')).toBe(false);
  });
});

describe('patientListRows', () => {
  const sreya: Patient = {
    ...amit,
    id: 'sreya',
    name: 'Sreya Roy',
    phone: '9830022222',
  };
  const appointments = [
    appt('a1', iso(24, 9), iso(1)), // Amit: visit at 9:00 today
    {...appt('s1', iso(24, 10), iso(2)), patientId: 'sreya'}, // Sreya: visit at 10:00 today
  ];

  it('puts the most recent activity first', () => {
    expect(
      patientListRows([amit, sreya], appointments, [], '', now).map(r => [
        r.name,
        r.activity,
        r.when,
      ]),
    ).toEqual([
      ['Sreya Roy', 'Visit', '10:00 AM'],
      ['Amit Das', 'Visit', '9:00 AM'],
    ]);
  });

  it('filters by the search text', () => {
    expect(
      patientListRows([amit, sreya], appointments, [], 'amit', now).map(
        r => r.name,
      ),
    ).toEqual(['Amit Das']);
  });
});
