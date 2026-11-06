import {describe, expect, it} from 'bun:test';
import {useDoctorStore} from 'src/store/useDoctorStore';
import {mmkvInstances} from '../setup/preload';

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
  });
});
