import {beforeEach, describe, expect, it} from 'bun:test';
import {useAuthStore} from 'src/store/useAuthStore';
import {useClinicStore} from 'src/store/useClinicStore';
import {fakeServer, oid} from '../setup/fakeServer';

const ankita = {
  name: 'Ankita Bose',
  age: 29,
  phone: '+91 98300 12345',
  email: '',
};
const startsAt = new Date(2025, 9, 25, 10, 30);
const serverPatient = {...ankita, id: oid(1), createdAt: '2025-10-24T03:30:00.000Z'};

const booking = (n: number, overlaps: string[] = []) => ({
  status: 201,
  json: {
    data: {
      appointment: {
        id: oid(100 + n),
        patientId: oid(1),
        startsAt: startsAt.toISOString(),
        createdAt: '2025-10-24T03:30:00.000Z',
      },
      patient: serverPatient,
      patientCreated: n === 1,
    },
    warnings: {overlaps, inPast: false},
  },
});

beforeEach(() => {
  useAuthStore.setState({token: 'tok', isLoggedIn: true});
  useClinicStore.setState({patients: [], appointments: [], entries: []});
});

describe('addAppointment', () => {
  it('books on the server and caches the patient and appointment', async () => {
    const calls = fakeServer(() => booking(1));
    const {id, warnings} = await useClinicStore
      .getState()
      .addAppointment(ankita, startsAt);

    expect(calls[0]).toMatchObject({
      method: 'POST',
      path: '/api/appointments',
      json: {startsAt: startsAt.toISOString(), patient: ankita},
      auth: 'Bearer tok',
    });
    expect(id).toBe(oid(101));
    expect(warnings.overlaps).toEqual([]);
    const {patients, appointments} = useClinicStore.getState();
    expect(patients).toEqual([serverPatient]);
    expect(appointments.map(a => a.id)).toEqual([oid(101)]);
  });

  it('does not duplicate a returning patient the server matched', async () => {
    let n = 0;
    fakeServer(() => booking(++n, n > 1 ? [startsAt.toISOString()] : []));
    const {addAppointment} = useClinicStore.getState();
    await addAppointment(ankita, startsAt);
    const second = await addAppointment(
      {...ankita, phone: '9830012345'},
      startsAt,
    );
    expect(second.warnings.overlaps).toHaveLength(1);
    const {patients, appointments} = useClinicStore.getState();
    expect(patients).toHaveLength(1);
    expect(appointments).toHaveLength(2);
  });

  it('leaves the cache alone when the server can’t be reached', async () => {
    fakeServer(() => 'offline');
    await expect(
      useClinicStore.getState().addAppointment(ankita, startsAt),
    ).rejects.toMatchObject({status: 0});
    expect(useClinicStore.getState().appointments).toEqual([]);
  });
});

describe('addEntry', () => {
  it('uploads a note and caches the server entry', async () => {
    const calls = fakeServer(() => ({
      status: 201,
      json: {
        data: {
          id: oid(7),
          patientId: oid(1),
          at: '2025-10-24T06:20:00.000Z',
          docType: null,
          file: null,
          note: 'Crown prep',
        },
      },
    }));
    const id = await useClinicStore
      .getState()
      .addEntry({patientId: oid(1), docType: null, file: null, note: 'Crown prep'});

    expect(calls[0]).toMatchObject({
      method: 'POST',
      path: `/api/patients/${oid(1)}/records`,
      form: {type: 'note', note: 'Crown prep'},
    });
    expect(useClinicStore.getState().entries).toEqual([
      {
        id,
        patientId: oid(1),
        at: '2025-10-24T06:20:00.000Z',
        docType: null,
        file: null,
        note: 'Crown prep',
      },
    ]);
  });

  it('keeps the local copy of an uploaded file', async () => {
    fakeServer(() => ({
      status: 201,
      json: {
        data: {
          id: oid(8),
          patientId: oid(1),
          at: '2025-10-24T06:20:00.000Z',
          docType: 'prescription',
          file: {
            fileId: oid(50),
            name: 'Rx.pdf',
            size: 2048,
            mimeType: 'application/pdf',
            url: `/api/files/${oid(50)}`,
          },
          note: '',
        },
      },
    }));
    await useClinicStore.getState().addEntry({
      patientId: oid(1),
      docType: 'prescription',
      file: {
        uri: 'file:///docs/Rx.pdf',
        name: 'Rx.pdf',
        size: 2048,
        mimeType: 'application/pdf',
      },
      note: '',
    });
    expect(useClinicStore.getState().entries[0].file).toEqual({
      uri: 'file:///docs/Rx.pdf',
      fileId: oid(50),
      name: 'Rx.pdf',
      size: 2048,
      mimeType: 'application/pdf',
    });
  });
});
