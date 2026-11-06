import {format} from 'date-fns';
import {phoneDigits} from 'src/features/patients/patientDraft';

// Clinic phones are Indian; 10-digit numbers get this prefix for WhatsApp.
export const DEFAULT_COUNTRY_CODE = '91';

type MessageInput = {
  patientName: string;
  startsAt: Date;
  doctorName?: string;
  clinicName?: string;
  clinicPhone?: string;
};

// The design's text, dropping whatever the doctor hasn't filled in yet:
// "Hi Ankita, your appointment with Dr. Subhas Middya at Smile Dental Clinic is on
//  Sat, 25 Oct 2025 at 10:30 AM. Reply or call +91 98765 00000 to reschedule."
export const appointmentMessage = ({
  patientName,
  startsAt,
  doctorName,
  clinicName,
  clinicPhone,
}: MessageInput) => {
  const firstName = patientName.trim().split(/\s+/)[0];
  const withWhom = [
    doctorName && `with ${doctorName}`,
    clinicName && `at ${clinicName}`,
  ]
    .filter(Boolean)
    .map(part => ` ${part}`)
    .join('');
  const when = format(startsAt, "EEE, d MMM yyyy 'at' h:mm a");
  const reschedule = clinicPhone
    ? `Reply or call ${clinicPhone} to reschedule.`
    : 'Reply to this message to reschedule.';
  return `Hi ${firstName}, your appointment${withWhom} is on ${when}. ${reschedule}`;
};

// SmsManager takes digits with an optional leading "+".
export const smsNumber = (phone: string) => phone.replace(/[^\d+]/g, '');

// wa.me wants the full international number, digits only.
export const whatsAppNumber = (phone: string) => {
  const digits = phoneDigits(phone);
  return digits.length === 10 ? DEFAULT_COUNTRY_CODE + digits : digits;
};
