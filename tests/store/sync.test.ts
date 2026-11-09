import {beforeEach, describe, expect, it} from 'bun:test';
import {useAuthStore} from 'src/store/useAuthStore';
import {useClinicStore} from 'src/store/useClinicStore';
import {EMPTY_PROFILE, useDoctorStore} from 'src/store/useDoctorStore';
import {applySync, clearData, syncAll, useSyncStore} from 'src/store/sync';
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
  clearData();
});

describe('applySync', () => {
  it('replaces everything in memory with the server data', () => {
    useClinicStore.setState({
      patients: [patient('demo-1'), patient('local-1', 'Riya Das')],
    });
    applySync({
      ...emptySync(serverDoctor({name: 'Dr. A', photoUrl: '/api/files/a'})),
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
    expect(patients.map(p => p.id)).toEqual([oid(1)]);
    // No file on the phone: it opens from the server by fileId.
    expect(entries[0].file).toMatchObject({uri: '', fileId: oid(50)});
    expect(useDoctorStore.getState().profile).toMatchObject({
      name: 'Dr. A',
      photoUrl: '/api/files/a',
    });
  });
});

describe('syncAll', () => {
  it('shares one run between overlapping calls', async () => {
    const calls = fakeServer(() => ({json: emptySync()}));
    await Promise.all([syncAll(), syncAll()]);
    expect(calls.filter(c => c.path === '/api/sync')).toHaveLength(1);
  });

  it('is ready after the first load, and shows Retry when it fails', async () => {
    expect(useSyncStore.getState().status).toBe('idle');
    fakeServer(() => 'offline');
    await expect(syncAll()).rejects.toMatchObject({status: 0});
    expect(useSyncStore.getState().status).toBe('error');

    fakeServer(() => ({json: emptySync()}));
    await syncAll();
    expect(useSyncStore.getState().status).toBe('ready');
  });

  it('keeps what is on screen when a later refresh fails', async () => {
    fakeServer(() => ({json: {...emptySync(), patients: [patient(oid(1))]}}));
    await syncAll();
    fakeServer(() => 'offline');
    await expect(syncAll()).rejects.toMatchObject({status: 0});
    expect(useSyncStore.getState().status).toBe('ready');
    expect(useClinicStore.getState().patients).toHaveLength(1);
  });
});

describe('clearData', () => {
  it('drops everything held in memory', async () => {
    fakeServer(() => ({
      json: {
        ...emptySync(serverDoctor({name: 'Dr. A'})),
        patients: [patient(oid(1))],
      },
    }));
    await syncAll();
    clearData();
    expect(useClinicStore.getState().patients).toEqual([]);
    expect(useDoctorStore.getState().profile).toEqual(EMPTY_PROFILE);
    expect(useSyncStore.getState().status).toBe('idle');
  });
});
