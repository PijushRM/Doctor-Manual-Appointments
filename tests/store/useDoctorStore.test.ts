import {describe, expect, it} from 'bun:test';
import {useAuthStore} from 'src/store/useAuthStore';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {mmkvInstances} from '../setup/preload';
import {fakeServer, serverDoctor} from '../setup/fakeServer';

describe('useDoctorStore persistence', () => {
  it('restores saved settings and fills new profile fields with defaults', async () => {
    // As saved by an older build: a partial profile, alerts switched on.
    mmkvInstances.get('default')!.set(
      'doctor',
      JSON.stringify({
        state: {alerts: true, profile: {name: 'Dr. X'}},
        version: 0,
      }),
    );
    await useDoctorStore.persist.rehydrate();

    const {alerts, profile} = useDoctorStore.getState();
    expect(alerts).toBe(true);
    expect(profile.name).toBe('Dr. X');
    expect(profile.opens).toBe(9 * 60); // default for a field the old save lacked
    expect(profile.photoUrl).toBe('');
  });
});

describe('saveProfile', () => {
  it('uploads the photo first, then the fields, and caches the result', async () => {
    useAuthStore.setState({token: 'tok', isLoggedIn: true});
    const calls = fakeServer(({path, json}) =>
      path === '/api/doctor/photo'
        ? {json: {doctor: serverDoctor({photoUrl: '/api/files/p1'})}}
        : {json: {doctor: serverDoctor({photoUrl: '/api/files/p1', ...(json as object)})}},
    );
    await useDoctorStore.getState().saveProfile(
      {name: 'Dr. Y', clinicName: 'Smile'},
      {uri: 'file:///me.jpg', name: 'me.jpg', size: 10, mimeType: 'image/jpeg'},
    );
    expect(calls.map(c => [c.method, c.path])).toEqual([
      ['PUT', '/api/doctor/photo'],
      ['PATCH', '/api/doctor/profile'],
    ]);
    expect(calls[1].json).toEqual({name: 'Dr. Y', clinicName: 'Smile'});
    expect(useDoctorStore.getState().profile).toMatchObject({
      name: 'Dr. Y',
      clinicName: 'Smile',
      photoUri: 'file:///me.jpg',
      photoUrl: '/api/files/p1',
    });
  });

  it('keeps the cached profile when the save fails', async () => {
    const before = useDoctorStore.getState().profile;
    fakeServer(() => 'offline');
    await expect(
      useDoctorStore.getState().saveProfile({name: 'Dr. Z'}),
    ).rejects.toMatchObject({status: 0});
    expect(useDoctorStore.getState().profile).toEqual(before);
  });
});
