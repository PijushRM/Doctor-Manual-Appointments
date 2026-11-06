import {describe, expect, it} from 'bun:test';
import {
  appointmentMessage,
  smsNumber,
  whatsAppNumber,
} from 'src/features/appointments/message';

const startsAt = new Date(2025, 9, 25, 10, 30);

describe('appointmentMessage', () => {
  it('matches the design when the profile is complete', () => {
    expect(
      appointmentMessage({
        patientName: 'Ankita Bose',
        startsAt,
        doctorName: 'Dr. Subhas Middya',
        clinicName: 'Smile Dental Clinic',
        clinicPhone: '+91 98765 00000',
      }),
    ).toBe(
      'Hi Ankita, your appointment with Dr. Subhas Middya at Smile Dental Clinic is on Sat, 25 Oct 2025 at 10:30 AM. Reply or call +91 98765 00000 to reschedule.',
    );
  });

  it('still reads well before the doctor fills in their profile', () => {
    expect(appointmentMessage({patientName: '  Riya Das', startsAt})).toBe(
      'Hi Riya, your appointment is on Sat, 25 Oct 2025 at 10:30 AM. Reply to this message to reschedule.',
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
