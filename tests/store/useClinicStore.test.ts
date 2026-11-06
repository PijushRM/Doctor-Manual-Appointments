import {beforeEach, describe, expect, it} from 'bun:test';
import {useClinicStore} from 'src/store/useClinicStore';

const ankita = {
  name: 'Ankita Bose',
  age: 29,
  phone: '+91 98300 12345',
  email: '',
};
const startsAt = new Date(2025, 9, 25, 10, 30);

describe('addAppointment', () => {
  beforeEach(() =>
    useClinicStore.setState({patients: [], appointments: [], entries: []}),
  );

  it('adds a new patient and the appointment', () => {
    const now = new Date(2025, 9, 24, 9, 0);
    const id = useClinicStore.getState().addAppointment(ankita, startsAt, now);
    const {patients, appointments} = useClinicStore.getState();
    expect(patients).toHaveLength(1);
    expect(patients[0]).toMatchObject(ankita);
    expect(appointments).toEqual([
      {
        id,
        patientId: patients[0].id,
        startsAt: startsAt.toISOString(),
        createdAt: now.toISOString(),
      },
    ]);
  });

  it('books a returning patient without duplicating them', () => {
    const {addAppointment} = useClinicStore.getState();
    addAppointment(ankita, startsAt);
    addAppointment(
      {...ankita, phone: '9830012345'},
      new Date(2025, 9, 27, 9, 0),
    );
    const {patients, appointments} = useClinicStore.getState();
    expect(patients).toHaveLength(1);
    expect(appointments.map(a => a.patientId)).toEqual([
      patients[0].id,
      patients[0].id,
    ]);
  });

  it('keeps a family member on the same phone as a separate patient', () => {
    const {addAppointment} = useClinicStore.getState();
    addAppointment(ankita, startsAt);
    addAppointment({...ankita, name: 'Rohan Bose', age: 8}, startsAt);
    expect(useClinicStore.getState().patients.map(p => p.name)).toEqual([
      'Ankita Bose',
      'Rohan Bose',
    ]);
  });
});

describe('addEntry', () => {
  it('stamps the entry with an id and the time', () => {
    useClinicStore.setState({entries: []});
    const now = new Date(2025, 9, 24, 11, 50);
    const id = useClinicStore
      .getState()
      .addEntry(
        {patientId: 'p1', docType: null, file: null, note: 'Crown prep'},
        now,
      );
    expect(useClinicStore.getState().entries).toEqual([
      {
        id,
        patientId: 'p1',
        at: now.toISOString(),
        docType: null,
        file: null,
        note: 'Crown prep',
      },
    ]);
  });
});
