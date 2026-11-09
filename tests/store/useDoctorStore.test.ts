import {describe, expect, it} from 'bun:test';
import {useAuthStore} from 'src/store/useAuthStore';
import {EMPTY_PROFILE, useDoctorStore} from 'src/store/useDoctorStore';
import {mmkvInstances} from '../setup/preload';
import {fakeServer, serverDoctor} from '../setup/fakeServer';

describe('useDoctorStore persistence', () => {
  it('saves only the alerts switch on the phone, never the profile', async () => {
    useDoctorStore.setState(s => ({
      alerts: true,
      profile: {...s.profile, name: 'Dr. X'},
    }));
    const saved = JSON.parse(
      mmkvInstances.get('default')!.get('doctor-settings')!,
    );
    expect(saved.state).toEqual({alerts: true});

    // After a restart: alerts come back, the profile waits for the server.
    useDoctorStore.setState({profile: EMPTY_PROFILE});
    mmkvInstances
      .get('default')!
      .set(
        'doctor-settings',
        JSON.stringify({state: {alerts: false}, version: 0}),
      );
    await useDoctorStore.persist.rehydrate();
    expect(useDoctorStore.getState().alerts).toBe(false);
    expect(useDoctorStore.getState().profile).toEqual(EMPTY_PROFILE);
  });
});

describe('saveProfile', () => {
  it('uploads the photo first, then the fields, and shows the server copy', async () => {
    useAuthStore.setState({token: 'tok', isLoggedIn: true});
    const calls = fakeServer(({path, json}) =>
      path === '/api/doctor/photo'
        ? {json: {doctor: serverDoctor({photoUrl: '/api/files/p1'})}}
        : {
            json: {
              doctor: serverDoctor({
                photoUrl: '/api/files/p1',
                ...(json as object),
              }),
            },
          },
    );
    await useDoctorStore
      .getState()
      .saveProfile(
        {name: 'Dr. Y', clinicName: 'Smile'},
        {
          uri: 'file:///me.jpg',
          name: 'me.jpg',
          size: 10,
          mimeType: 'image/jpeg',
        },
      );
    expect(calls.map(c => [c.method, c.path])).toEqual([
      ['PUT', '/api/doctor/photo'],
      ['PATCH', '/api/doctor/profile'],
    ]);
    expect(calls[1].json).toEqual({name: 'Dr. Y', clinicName: 'Smile'});
    expect(useDoctorStore.getState().profile).toMatchObject({
      name: 'Dr. Y',
      clinicName: 'Smile',
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
