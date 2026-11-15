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
const serverPatient = {
  ...ankita,
  id: oid(1),
  createdAt: '2025-10-24T03:30:00.000Z',
};

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
    const id = await useClinicStore.getState().addEntry({
      patientId: oid(1),
      docType: null,
      file: null,
      note: 'Crown prep',
    });

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

  it('keeps no copy of an uploaded file on the phone', async () => {
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
    // It opens from the server by fileId.
    expect(useClinicStore.getState().entries[0].file).toEqual({
      uri: '',
      fileId: oid(50),
      name: 'Rx.pdf',
      size: 2048,
      mimeType: 'application/pdf',
    });
  });
});

describe('rescheduleAppointment', () => {
  const later = new Date(2025, 9, 26, 16, 0);
  const existing = {
    id: oid(101),
    patientId: oid(1),
    startsAt: startsAt.toISOString(),
    createdAt: '2025-10-24T03:30:00.000Z',
  };

  it('moves the appointment on the server and shows the new time', async () => {
    useClinicStore.setState({
      patients: [serverPatient],
      appointments: [existing],
    });
    const calls = fakeServer(() => ({
      json: {
        data: {
          appointment: {...existing, startsAt: later.toISOString()},
          patient: serverPatient,
        },
        warnings: {overlaps: [], inPast: false},
      },
    }));
    const {warnings} = await useClinicStore
      .getState()
      .rescheduleAppointment(oid(101), later);
    expect(calls.map(c => [c.method, c.path])).toEqual([
      ['PATCH', `/api/appointments/${oid(101)}`],
    ]);
    expect(calls[0].json).toEqual({startsAt: later.toISOString()});
    expect(useClinicStore.getState().appointments).toEqual([
      {...existing, startsAt: later.toISOString()},
    ]);
    expect(warnings).toEqual({overlaps: [], inPast: false});
  });

  it('leaves the time alone when the server can’t be reached', async () => {
    useClinicStore.setState({appointments: [existing]});
    fakeServer(() => 'offline');
    await expect(
      useClinicStore.getState().rescheduleAppointment(oid(101), later),
    ).rejects.toMatchObject({status: 0});
    expect(useClinicStore.getState().appointments).toEqual([existing]);
  });
});

describe('patient actions', () => {
  const appointment = {
    id: oid(101),
    patientId: oid(1),
    startsAt: startsAt.toISOString(),
    createdAt: '2025-10-24T03:30:00.000Z',
  };

  it('marks an appointment absent, and back', async () => {
    useClinicStore.setState({appointments: [appointment]});
    const calls = fakeServer(({json}) => ({
      json: {
        data: {
          appointment: {...appointment, ...(json as object)},
          patient: serverPatient,
        },
        warnings: {overlaps: [], inPast: false},
      },
    }));
    await useClinicStore.getState().setAbsent(oid(101), true);
    expect(calls[0]).toMatchObject({
      method: 'PATCH',
      path: `/api/appointments/${oid(101)}`,
      json: {status: 'absent'},
    });
    expect(useClinicStore.getState().appointments[0].status).toBe('absent');
    await useClinicStore.getState().setAbsent(oid(101), false);
    expect(calls[1].json).toEqual({status: 'booked'});
    expect(useClinicStore.getState().appointments[0].status).toBe('booked');
  });

  it('edits a patient’s details', async () => {
    useClinicStore.setState({patients: [serverPatient]});
    const calls = fakeServer(() => ({
      json: {data: {...serverPatient, age: 30}},
    }));
    await useClinicStore.getState().updatePatient(oid(1), {age: 30});
    expect(calls[0]).toMatchObject({
      method: 'PATCH',
      path: `/api/patients/${oid(1)}`,
      json: {age: 30},
    });
    expect(useClinicStore.getState().patients[0].age).toBe(30);
  });

  it('deletes a patient with their appointments and records', async () => {
    useClinicStore.setState({
      patients: [serverPatient],
      appointments: [appointment],
      entries: [
        {
          id: oid(7),
          patientId: oid(1),
          at: '',
          docType: null,
          file: null,
          note: 'x',
        },
      ],
    });
    const calls = fakeServer(() => ({json: {ok: true}}));
    await useClinicStore.getState().deletePatient(oid(1));
    expect(calls[0]).toMatchObject({
      method: 'DELETE',
      path: `/api/patients/${oid(1)}`,
    });
    const s = useClinicStore.getState();
    expect([s.patients, s.appointments, s.entries]).toEqual([[], [], []]);
  });

  it('books the next appointment for a patient on the list', async () => {
    useClinicStore.setState({patients: [serverPatient]});
    const calls = fakeServer(() => booking(2));
    const {id} = await useClinicStore
      .getState()
      .bookForPatient(oid(1), startsAt);
    expect(calls[0].json).toEqual({
      startsAt: startsAt.toISOString(),
      patientId: oid(1),
    });
    expect(useClinicStore.getState().appointments.map(a => a.id)).toEqual([id]);
  });
});
