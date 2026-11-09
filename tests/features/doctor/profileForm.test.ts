import {describe, expect, it} from 'bun:test';
import {useLanguageStore} from 'src/i18n';
import {parseClinic, parseDetails} from 'src/features/doctor/profileForm';

describe('parseDetails', () => {
  it('tidies the fields and requires a name', () => {
    expect(
      parseDetails({
        name: ' Dr.  Subhas Middya ',
        qualifications: 'BDS,  MDS',
        speciality: '',
      }),
    ).toEqual({
      values: {
        name: 'Dr. Subhas Middya',
        qualifications: 'BDS, MDS',
        speciality: '',
      },
      errors: {},
    });
    expect(
      parseDetails({name: ' ', qualifications: '', speciality: ''}).errors,
    ).toEqual({
      name: 'Enter your name.',
    });
  });
});

describe('parseClinic', () => {
  const ok = {
    email: 'dr@clinic.in',
    phone: '+91 98765 00000',
    clinicName: 'Smile  Dental',
    opens: 540,
    closes: 1080,
    workingDays: [false, true, true, true, true, true, true],
  };

  it('accepts a valid clinic and tidies it', () => {
    const {values, errors} = parseClinic(ok);
    expect(errors).toEqual({});
    expect(values.clinicName).toBe('Smile Dental');
  });

  it('allows blank contact details but not malformed ones', () => {
    expect(parseClinic({...ok, email: '', phone: ''}).errors).toEqual({});
    expect(
      Object.keys(parseClinic({...ok, email: 'dr@', phone: '123'}).errors),
    ).toEqual(['email', 'phone']);
  });

  it('needs closing after opening, and at least one working day', () => {
    expect(Object.keys(parseClinic({...ok, closes: 540}).errors)).toEqual([
      'hours',
    ]);
    expect(
      Object.keys(
        parseClinic({...ok, workingDays: Array(7).fill(false)}).errors,
      ),
    ).toEqual(['days']);
  });
});

describe('in Bengali', () => {
  it('explains problems in Bengali', () => {
    useLanguageStore.setState({language: 'bn'});
    try {
      expect(
        parseDetails({name: ' ', qualifications: '', speciality: ''}).errors,
      ).toEqual({name: 'আপনার নাম লিখুন।'});
    } finally {
      useLanguageStore.setState({language: 'en'});
    }
  });
});
