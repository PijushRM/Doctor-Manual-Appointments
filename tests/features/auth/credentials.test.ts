import {describe, expect, it} from 'bun:test';
import {
  createAccount,
  matchesAccount,
  validateLogin,
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

describe('createAccount / matchesAccount', () => {
  const account = createAccount(
    ' Dr.Subhas@SmileDental.in ',
    'password123',
    'salt',
  );

  it('stores a normalized identifier and no plain password', () => {
    expect(account.identifier).toBe('dr.subhas@smiledental.in');
    expect(JSON.stringify(account)).not.toContain('password123');
  });

  it('matches the same credentials, ignoring identifier case and spaces', () => {
    expect(
      matchesAccount(account, 'DR.SUBHAS@smiledental.in', 'password123'),
    ).toBe(true);
  });

  it('rejects a wrong password or identifier', () => {
    expect(
      matchesAccount(account, 'dr.subhas@smiledental.in', 'password124'),
    ).toBe(false);
    expect(matchesAccount(account, 'someone@else.in', 'password123')).toBe(
      false,
    );
  });

  it('salts the hash', () => {
    expect(createAccount('a@b.in', 'password123', 'other').hash).not.toBe(
      createAccount('a@b.in', 'password123', 'salt').hash,
    );
  });
});
