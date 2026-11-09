import {beforeEach, describe, expect, it} from 'bun:test';
import {api} from 'src/services/api';
import {useAuthStore} from 'src/store/useAuthStore';
import {useClinicStore} from 'src/store/useClinicStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {clearData, useSyncStore} from 'src/store/sync';
import {mmkvInstances} from '../setup/preload';
import {emptySync, fakeServer, oid, serverDoctor} from '../setup/fakeServer';

const {logIn, logOut, changePassword} = useAuthStore.getState();

const session = (doctor = serverDoctor()) => ({
  status: 200,
  json: {token: 'tok-1', doctor},
});

const reset = () => {
  useAuthStore.setState({token: null, identifier: null, isLoggedIn: false});
  clearData();
};

describe('logIn', () => {
  beforeEach(reset);

  it('logs in with the server, keeps the token encrypted, and syncs', async () => {
    const patient = {
      id: oid(9),
      name: 'Amit Das',
      age: 34,
      phone: '9830012345',
      email: '',
      createdAt: '2026-11-01T00:00:00.000Z',
    };
    const calls = fakeServer(({path}) => {
      if (path === '/api/auth/login') {
        return session();
      }
      if (path === '/api/sync') {
        return {json: {...emptySync(), patients: [patient]}};
      }
    });

    expect(await logIn(' DR@clinic.in ', 'password123')).toBeNull();

    expect(calls[0]).toMatchObject({
      method: 'POST',
      path: '/api/auth/login',
      json: {identifier: 'dr@clinic.in', password: 'password123'},
    });
    expect(calls[1]).toMatchObject({path: '/api/sync', auth: 'Bearer tok-1'});
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(useClinicStore.getState().patients).toEqual([patient]);
    const saved = mmkvInstances.get('smile-doctor-secure')?.get('auth');
    expect(JSON.parse(saved!).state.token).toBe('tok-1');
    expect(saved).not.toContain('password123');
  });

  it('creates the account in register mode', async () => {
    const calls = fakeServer(({path}) =>
      path === '/api/auth/register'
        ? {status: 201, json: session().json}
        : {json: emptySync()},
    );
    expect(await logIn('dr@clinic.in', 'password123', 'register')).toBeNull();
    expect(calls[0].path).toBe('/api/auth/register');
  });

  it('maps server and network failures to login errors', async () => {
    fakeServer(() => ({status: 401, json: {error: 'nope'}}));
    expect(await logIn('dr@clinic.in', 'wrongpass')).toBe('mismatch');

    fakeServer(() => ({status: 409, json: {error: 'exists'}}));
    expect(await logIn('dr@clinic.in', 'password123', 'register')).toBe(
      'exists',
    );

    fakeServer(() => 'offline');
    expect(await logIn('dr@clinic.in', 'password123')).toBe('offline');

    fakeServer(() => ({status: 500, json: {error: 'boom'}}));
    expect(await logIn('dr@clinic.in', 'password123')).toBe('server');

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  it('validates on the phone without calling the server', async () => {
    const calls = fakeServer(() => undefined);
    expect(await logIn('', 'password123')).toBe('missingIdentifier');
    expect(await logIn('dr@clinic.in', '123')).toBe('shortPassword');
    expect(calls).toHaveLength(0);
  });

  it('still logs in when the first sync fails', async () => {
    fakeServer(({path}) => (path === '/api/sync' ? 'offline' : session()));
    expect(await logIn('dr@clinic.in', 'password123')).toBeNull();
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  });

  it('drops the previous doctor’s data when someone else logs in', async () => {
    useAuthStore.setState({identifier: 'other@clinic.in'});
    useClinicStore.setState({
      patients: [
        {
          id: 'local-1',
          name: 'X Y',
          age: 1,
          phone: '9830012345',
          email: '',
          createdAt: '',
        },
      ],
    });
    fakeServer(({path}) =>
      path === '/api/sync' ? {json: emptySync()} : session(),
    );
    await logIn('dr@clinic.in', 'password123');
    expect(useClinicStore.getState().patients).toEqual([]);
  });
});

describe('logOut and expired sessions', () => {
  beforeEach(reset);

  it('forgets the token and the cached server data', async () => {
    fakeServer(({path}) =>
      path === '/api/sync'
        ? {
            json: {
              ...emptySync(),
              patients: [
                {
                  id: oid(5),
                  name: 'A B',
                  age: 3,
                  phone: '9830012345',
                  email: '',
                  createdAt: '',
                },
              ],
            },
          }
        : session(),
    );
    await logIn('dr@clinic.in', 'password123');
    expect(useClinicStore.getState().patients).toHaveLength(1);
    logOut();
    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      isLoggedIn: false,
    });
    expect(useClinicStore.getState().patients).toEqual([]);
  });

  it('logs out when the server says the token is no longer valid', async () => {
    useAuthStore.setState({token: 'old', isLoggedIn: true});
    fakeServer(() => ({
      status: 401,
      json: {error: 'Invalid or expired token'},
    }));
    await expect(api.sync()).rejects.toThrow(
      'Your session has expired. Please log in again.',
    );
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});

describe('changePassword', () => {
  beforeEach(() => {
    reset();
    useAuthStore.setState({token: 'tok-1', isLoggedIn: true});
  });

  it('checks length and confirmation before calling the server', async () => {
    const calls = fakeServer(() => undefined);
    expect(await changePassword('password123', 'short', 'short')).toBe(
      'shortPassword',
    );
    expect(await changePassword('password123', 'newpass1', 'newpass2')).toBe(
      'notMatching',
    );
    expect(calls).toHaveLength(0);
  });

  it('reports a wrong current password from the server', async () => {
    fakeServer(() => ({
      status: 400,
      json: {
        error: 'x',
        details: {current: 'Your current password is incorrect.'},
      },
    }));
    expect(await changePassword('wrong1', 'newpass1', 'newpass1')).toBe(
      'wrongCurrent',
    );
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  });

  it('stores the new token on success', async () => {
    const calls = fakeServer(() => ({json: {ok: true, token: 'tok-2'}}));
    expect(
      await changePassword('password123', 'newpass1', 'newpass1'),
    ).toBeNull();
    expect(calls[0]).toMatchObject({
      path: '/api/auth/change-password',
      json: {current: 'password123', next: 'newpass1', confirm: 'newpass1'},
      auth: 'Bearer tok-1',
    });
    expect(useAuthStore.getState().token).toBe('tok-2');
  });

  it('says so when offline', async () => {
    fakeServer(() => 'offline');
    expect(await changePassword('password123', 'newpass1', 'newpass1')).toBe(
      'offline',
    );
  });
});

describe('first load after login', () => {
  beforeEach(reset);

  it('shows only the server data and uploads nothing from the phone', async () => {
    useClinicStore.setState({
      patients: [
        {
          id: 'local-1',
          name: 'Riya Das',
          age: 8,
          phone: '9830012345',
          email: '',
          createdAt: '',
        },
      ],
    });
    useDoctorStore.setState(s => ({profile: {...s.profile, name: 'Old Name'}}));
    const calls = fakeServer(({path}) =>
      path === '/api/sync'
        ? {json: emptySync(serverDoctor({name: 'Dr. Subhas Middya'}))}
        : session(serverDoctor({name: 'Dr. Subhas Middya'})),
    );
    await logIn('dr@clinic.in', 'password123');
    expect(calls.map(c => c.path)).toEqual(['/api/auth/login', '/api/sync']);
    expect(useClinicStore.getState().patients).toEqual([]);
    expect(useDoctorStore.getState().profile.name).toBe('Dr. Subhas Middya');
    expect(useSyncStore.getState().status).toBe('ready');
  });

  it('waits on the Retry screen when the first load fails', async () => {
    fakeServer(({path}) => (path === '/api/sync' ? 'offline' : session()));
    expect(await logIn('dr@clinic.in', 'password123')).toBeNull();
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(useSyncStore.getState().status).toBe('error');
  });
});
