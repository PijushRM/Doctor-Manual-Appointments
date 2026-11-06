import {beforeEach, describe, expect, it} from 'bun:test';
import {useAuthStore} from 'src/store/useAuthStore';
import {mmkvInstances} from '../setup/preload';

const {logIn, logOut, changePassword} = useAuthStore.getState();

describe('useAuthStore', () => {
  beforeEach(() => useAuthStore.setState({account: null, isLoggedIn: false}));

  it('claims the device on first login and persists it encrypted', () => {
    expect(logIn('dr@clinic.in', 'password123')).toBeNull();
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    const saved = mmkvInstances.get('smile-doctor-secure')?.get('auth');
    expect(JSON.parse(saved!).state.account.identifier).toBe('dr@clinic.in');
    expect(saved).not.toContain('password123');
  });

  it('only lets the claimed account back in after logout', () => {
    logIn('dr@clinic.in', 'password123');
    logOut();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(logIn('dr@clinic.in', 'wrongpass')).toBe('mismatch');
    expect(logIn('other@clinic.in', 'password123')).toBe('mismatch');
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(logIn('DR@clinic.in', 'password123')).toBeNull();
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  });

  it('returns validation errors without claiming the device', () => {
    expect(logIn('', 'password123')).toBe('missingIdentifier');
    expect(logIn('dr@clinic.in', '123')).toBe('shortPassword');
    expect(useAuthStore.getState().account).toBeNull();
  });
});

describe('changePassword', () => {
  beforeEach(() => {
    useAuthStore.setState({account: null, isLoggedIn: false});
    logIn('dr@clinic.in', 'password123');
  });

  it('checks the current password, length and confirmation', () => {
    expect(changePassword('wrong', 'newpass1', 'newpass1')).toBe(
      'wrongCurrent',
    );
    expect(changePassword('password123', 'short', 'short')).toBe(
      'shortPassword',
    );
    expect(changePassword('password123', 'newpass1', 'newpass2')).toBe(
      'notMatching',
    );
  });

  it('swaps the password: the old one stops working, the new one logs in', () => {
    expect(changePassword('password123', 'newpass1', 'newpass1')).toBeNull();
    logOut();
    expect(logIn('dr@clinic.in', 'password123')).toBe('mismatch');
    expect(logIn('dr@clinic.in', 'newpass1')).toBeNull();
  });
});
