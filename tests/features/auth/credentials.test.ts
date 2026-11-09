import {describe, expect, it} from 'bun:test';
import {
  normalizeIdentifier,
  validateLogin,
  validatePasswordChange,
} from 'src/features/auth/credentials';

describe('validateLogin', () => {
  it('needs an identifier', () => {
    expect(validateLogin('   ', 'password123')).toBe('missingIdentifier');
  });

  it('needs a password of at least 6 characters', () => {
    expect(validateLogin('dr@clinic.in', '12345')).toBe('shortPassword');
    expect(validateLogin('dr@clinic.in', '123456')).toBeNull();
  });
});

describe('normalizeIdentifier', () => {
  it('ignores case and surrounding spaces', () => {
    expect(normalizeIdentifier(' Dr.Subhas@SmileDental.in ')).toBe(
      'dr.subhas@smiledental.in',
    );
  });
});

describe('validatePasswordChange', () => {
  it('checks length, then confirmation', () => {
    expect(validatePasswordChange('short', 'short')).toBe('shortPassword');
    expect(validatePasswordChange('newpass1', 'newpass2')).toBe('notMatching');
    expect(validatePasswordChange('newpass1', 'newpass1')).toBeNull();
  });
});
