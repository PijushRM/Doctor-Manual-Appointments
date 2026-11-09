import {describe, expect, it} from 'bun:test';
import {
  EMPTY_DRAFT,
  findExistingPatient,
  parsePatientDraft,
} from 'src/features/patients/patientDraft';
import {useLanguageStore} from 'src/i18n';
import type {Patient} from 'src/types/clinic';

const valid = {
  name: '  Ankita   Bose ',
  age: '29',
  phone: '+91 98300 12345',
  email: 'ankita.bose@email.com',
};

describe('parsePatientDraft', () => {
  it('tidies a valid draft into a patient', () => {
    expect(parsePatientDraft(valid)).toEqual({
      patient: {
        name: 'Ankita Bose',
        age: 29,
        phone: '+91 98300 12345',
        email: 'ankita.bose@email.com',
      },
      errors: {},
    });
  });

  it('flags every missing required field', () => {
    const {patient, errors} = parsePatientDraft(EMPTY_DRAFT);
    expect(patient).toBeNull();
    expect(Object.keys(errors).sort()).toEqual(['age', 'name', 'phone']);
  });

  it('allows a blank email but not a malformed one', () => {
    expect(parsePatientDraft({...valid, email: ''}).patient?.email).toBe('');
    expect(
      parsePatientDraft({...valid, email: 'ankita@'}).errors.email,
    ).toBeDefined();
  });

  it('checks age is a whole number from 0 to 120', () => {
    expect(parsePatientDraft({...valid, age: '0'}).errors.age).toBeUndefined();
    expect(parsePatientDraft({...valid, age: '121'}).errors.age).toBeDefined();
    expect(parsePatientDraft({...valid, age: '2.5'}).errors.age).toBeDefined();
    expect(parsePatientDraft({...valid, age: '-3'}).errors.age).toBeDefined();
  });

  it('accepts 10–13 digit phone numbers with common punctuation', () => {
    const phoneError = (phone: string) =>
      parsePatientDraft({...valid, phone}).errors.phone;
    expect(phoneError('9830012345')).toBeUndefined();
    expect(phoneError('(+91) 98300-12345')).toBeUndefined();
    expect(phoneError('98300 12345')).toBeUndefined();
    expect(phoneError('983001234')).toBeDefined();
    expect(phoneError('98300abc45')).toBeDefined();
    expect(phoneError('+91 98300 12345 678')).toBeDefined();
  });
});

describe('parsePatientDraft in Bengali', () => {
  it('explains problems in Bengali', () => {
    useLanguageStore.setState({language: 'bn'});
    try {
      const {errors} = parsePatientDraft(EMPTY_DRAFT);
      expect(errors.name).toBe('রোগীর পুরো নাম লিখুন।');
      expect(errors.age).toBe('বয়স ০–১২০');
    } finally {
      useLanguageStore.setState({language: 'en'});
    }
  });
});

describe('findExistingPatient', () => {
  const amit: Patient = {
    id: 'p1',
    name: 'Amit Das',
    age: 45,
    phone: '+91 98300 11111',
    email: '',
    createdAt: '',
  };

  it('matches the same name and phone, ignoring formatting and case', () => {
    expect(
      findExistingPatient([amit], {name: ' amit  das', phone: '9830011111'}),
    ).toBe(amit);
  });

  it('keeps family members on a shared phone separate', () => {
    expect(
      findExistingPatient([amit], {name: 'Riya Das', phone: '9830011111'}),
    ).toBeUndefined();
  });

  it('never matches on a partial phone number', () => {
    expect(
      findExistingPatient([{...amit, phone: '11111'}], {
        name: 'Amit Das',
        phone: '11111',
      }),
    ).toBeUndefined();
  });
});
