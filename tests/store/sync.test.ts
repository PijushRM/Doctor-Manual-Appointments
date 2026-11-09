import {beforeEach, describe, expect, it} from 'bun:test';
import {useAuthStore} from 'src/store/useAuthStore';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {applySync, syncAll, uploadLocalData} from 'src/store/sync';
import type {Patient} from 'src/types/clinic';
import {emptySync, fakeServer, oid, serverDoctor} from '../setup/fakeServer';

const patient = (id: string, name = 'Amit Das'): Patient => ({
  id,
  name,
  age: 34,
  phone: '9830012345',
  email: '',
  createdAt: '2025-10-01T00:00:00.000Z',
});

beforeEach(() => {
  useAuthStore.setState({token: 'tok', isLoggedIn: true});
  useClinicStore.setState({patients: [], appointments: [], entries: []});
});

describe('applySync', () => {
  it('replaces server data, keeps local file copies and unsent records, drops demo data', () => {
    useClinicStore.setState({
      patients: [patient('demo-1'), patient('local-1', 'Riya Das')],
      entries: [
        {
          id: oid(7),
          patientId: oid(1),
          at: '',
          docType: 'report',
          file: {uri: 'file:///r.pdf', name: 'r.pdf', size: 1, mimeType: 'application/pdf'},
          note: '',
        },
      ],
    });
    applySync({
      ...emptySync(serverDoctor({name: 'Dr. A'})),
      patients: [patient(oid(1))],
      entries: [
        {
          id: oid(7),
          patientId: oid(1),
          at: '',
          docType: 'report',
          file: {
            fileId: oid(50),
            name: 'r.pdf',
            size: 1,
            mimeType: 'application/pdf',
            url: '',
          },
          note: '',
        },
      ],
    });
    const {patients, entries} = useClinicStore.getState();
    expect(patients.map(p => p.id)).toEqual([oid(1), 'local-1']);
    expect(entries[0].file).toMatchObject({uri: 'file:///r.pdf', fileId: oid(50)});
    expect(useDoctorStore.getState().profile.name).toBe('Dr. A');
  });

  it('drops the local photo copy once the server has a different photo', () => {
    useDoctorStore.setState(s => ({
      profile: {...s.profile, photoUri: 'file:///me.jpg', photoUrl: '/api/files/a'},
    }));
    applySync(emptySync(serverDoctor({photoUrl: '/api/files/a'})));
    expect(useDoctorStore.getState().profile.photoUri).toBe('file:///me.jpg');
    applySync(emptySync(serverDoctor({photoUrl: '/api/files/b'})));
    expect(useDoctorStore.getState().profile.photoUri).toBe('');
  });
});

describe('uploadLocalData', () => {
  it('uploads patients, then their appointments and notes, under server ids', async () => {
    useClinicStore.setState({
      patients: [patient('local-p')],
      appointments: [
        {id: 'local-a', patientId: 'local-p', startsAt: '2025-10-25T05:00:00.000Z', createdAt: ''},
      ],
      entries: [
        {id: 'local-e', patientId: 'local-p', at: '', docType: null, file: null, note: 'Hi'},
      ],
    });
    const calls = fakeServer(({path}) => {
      if (path === '/api/patients') {
        return {status: 201, json: {data: patient(oid(1)), created: true}};
      }
      if (path === '/api/appointments') {
        return {
          status: 201,
          json: {
            data: {
              appointment: {id: oid(2), patientId: oid(1), startsAt: '2025-10-25T05:00:00.000Z', createdAt: ''},
              patient: patient(oid(1)),
              patientCreated: false,
            },
            warnings: {overlaps: [], inPast: true},
          },
        };
      }
      return {
        status: 201,
        json: {data: {id: oid(3), patientId: oid(1), at: '', docType: null, file: null, note: 'Hi'}},
      };
    });

    await uploadLocalData();

    expect(calls.map(c => c.path)).toEqual([
      '/api/patients',
      '/api/appointments',
      `/api/patients/${oid(1)}/records`,
    ]);
    expect(calls[1].json).toMatchObject({patientId: oid(1)});
    const {patients, appointments, entries} = useClinicStore.getState();
    expect(patients.map(p => p.id)).toEqual([oid(1)]);
    expect(appointments).toEqual([
      {id: oid(2), patientId: oid(1), startsAt: '2025-10-25T05:00:00.000Z', createdAt: ''},
    ]);
    expect(entries.map(e => [e.id, e.patientId])).toEqual([[oid(3), oid(1)]]);
  });

  it('keeps everything for later when offline, and drops what the server refuses', async () => {
    useClinicStore.setState({patients: [patient('local-p')]});
    fakeServer(() => 'offline');
    await expect(uploadLocalData()).rejects.toMatchObject({status: 0});
    expect(useClinicStore.getState().patients).toHaveLength(1);

    fakeServer(() => ({status: 400, json: {error: 'Validation failed'}}));
    await uploadLocalData();
    expect(useClinicStore.getState().patients).toEqual([]);
  });

  it('never uploads demo data', async () => {
    useClinicStore.setState({patients: [patient('demo-0')]});
    const calls = fakeServer(() => undefined);
    await uploadLocalData();
    expect(calls).toHaveLength(0);
  });
});

describe('syncAll', () => {
  it('shares one run between overlapping calls', async () => {
    const calls = fakeServer(() => ({json: emptySync()}));
    await Promise.all([syncAll(), syncAll()]);
    expect(calls.filter(c => c.path === '/api/sync')).toHaveLength(1);
  });
});
