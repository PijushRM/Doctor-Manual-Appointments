import {describe, expect, it} from 'bun:test';
import {
  doctorInitials,
  initials,
  isNewPatient,
  splitSurname,
} from 'src/features/patients/patients';
import type {Patient} from 'src/types/clinic';

const patient = (createdAt: string): Patient => ({
  id: 'p',
  name: 'Rahul Saha',
  age: 32,
  phone: '',
  email: '',
  createdAt,
});

describe('initials', () => {
  it('takes the first and last word', () => {
    expect(initials('Rahul Saha')).toBe('RS');
    expect(initials('  arun kumar das ')).toBe('AD');
    expect(initials('Priya')).toBe('P');
    expect(initials('')).toBe('');
  });
});

describe('isNewPatient', () => {
  const now = new Date('2025-10-24T12:00:00');
  it('is new for 24 hours after being added', () => {
    expect(isNewPatient(patient('2025-10-24T08:00:00'), now)).toBe(true);
    expect(isNewPatient(patient('2025-10-23T12:00:01'), now)).toBe(true);
    expect(isNewPatient(patient('2025-10-23T12:00:00'), now)).toBe(false);
  });
});

describe('names', () => {
  it('splits off the surname for styling', () => {
    expect(splitSurname('Dr. Subhas Middya')).toEqual({
      firstNames: 'Dr. Subhas ',
      surname: 'Middya',
    });
    expect(splitSurname('Priya')).toEqual({firstNames: '', surname: 'Priya'});
  });

  it('skips the title in a doctor’s initials', () => {
    expect(doctorInitials('Dr. Subhas Middya')).toBe('SM');
    expect(doctorInitials('dr Anita Sen')).toBe('AS');
    expect(doctorInitials('Subhas Middya')).toBe('SM');
  });
});
