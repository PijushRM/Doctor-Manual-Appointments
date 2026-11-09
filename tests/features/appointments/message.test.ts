import {describe, expect, it} from 'bun:test';
import {
  appointmentMessage,
  bengaliDateTime,
  smsNumber,
  whatsAppNumber,
} from 'src/features/appointments/message';
import {useLanguageStore} from 'src/i18n';

const startsAt = new Date(2025, 9, 25, 10, 30);

const full = {
  patientName: 'Ankita Bose',
  startsAt,
  doctorName: 'Dr. Subhas Middya',
  clinicName: 'Smile Dental Clinic',
  clinicPhone: '+91 98765 00000',
};

describe('appointmentMessage in English', () => {
  it('matches the design when the profile is complete', () => {
    expect(appointmentMessage(full, 'en')).toBe(
      'Hi Ankita, your appointment with Dr. Subhas Middya at Smile Dental Clinic is on Sat, 25 Oct 2025 at 10:30 AM. Reply or call +91 98765 00000 to reschedule.',
    );
  });

  it('still reads well before the doctor fills in their profile', () => {
    expect(
      appointmentMessage({patientName: '  Riya Das', startsAt}, 'en'),
    ).toBe(
      'Hi Riya, your appointment is on Sat, 25 Oct 2025 at 10:30 AM. Reply to this message to reschedule.',
    );
  });
});

describe('appointmentMessage in Bengali', () => {
  it('is fully in Bengali when the profile is complete', () => {
    expect(appointmentMessage(full, 'bn')).toBe(
      'প্রিয় Ankita, Smile Dental Clinic-এ Dr. Subhas Middya-এর কাছে আপনার অ্যাপয়েন্টমেন্ট শনিবার, ২৫ অক্টোবর ২০২৫, সকাল ১০:৩০-এ নির্ধারিত হয়েছে। সময় বদলাতে চাইলে +91 98765 00000 নম্বরে ফোন করুন বা এই মেসেজের উত্তর দিন।',
    );
  });

  it('still reads well before the doctor fills in their profile', () => {
    expect(
      appointmentMessage({patientName: '  Riya Das', startsAt}, 'bn'),
    ).toBe(
      'প্রিয় Riya, আপনার অ্যাপয়েন্টমেন্ট শনিবার, ২৫ অক্টোবর ২০২৫, সকাল ১০:৩০-এ নির্ধারিত হয়েছে। সময় বদলাতে চাইলে এই মেসেজের উত্তর দিন।',
    );
  });

  it('follows the app language by default', () => {
    useLanguageStore.setState({language: 'bn'});
    expect(appointmentMessage(full)).toStartWith('প্রিয় Ankita');
    useLanguageStore.setState({language: 'en'});
    expect(appointmentMessage(full)).toStartWith('Hi Ankita');
  });
});

describe('bengaliDateTime', () => {
  it('names the part of the day instead of AM/PM', () => {
    const at = (h: number, m = 0) =>
      bengaliDateTime(new Date(2025, 9, 25, h, m)).split(', ').at(-1);
    expect(at(9, 5)).toBe('সকাল ৯:০৫');
    expect(at(12)).toBe('দুপুর ১২:০০');
    expect(at(16, 45)).toBe('বিকেল ৪:৪৫');
    expect(at(18, 30)).toBe('সন্ধ্যা ৬:৩০');
    expect(at(21)).toBe('রাত ৯:০০');
    expect(at(0, 15)).toBe('রাত ১২:১৫');
  });

  it('uses Bengali weekday, month and digits', () => {
    expect(bengaliDateTime(new Date(2026, 0, 4, 11, 0))).toBe(
      'রবিবার, ৪ জানুয়ারি ২০২৬, সকাল ১১:০০',
    );
  });
});

describe('phone numbers', () => {
  it('keeps digits and a leading + for SMS', () => {
    expect(smsNumber('+91 98300-12345')).toBe('+919830012345');
    expect(smsNumber('(98300) 12345')).toBe('9830012345');
  });

  it('adds the country code for WhatsApp when missing', () => {
    expect(whatsAppNumber('98300 12345')).toBe('919830012345');
    expect(whatsAppNumber('+91 98300 12345')).toBe('919830012345');
  });
});
