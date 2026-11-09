import {format} from 'date-fns';
import {phoneDigits} from 'src/features/patients/patientDraft';
import {getLanguage, type Language} from 'src/i18n';
import {bengaliDigits, clockTime} from 'src/i18n/format';

// Clinic phones are Indian; 10-digit numbers get this prefix for WhatsApp.
export const DEFAULT_COUNTRY_CODE = '91';

type MessageInput = {
  patientName: string;
  startsAt: Date;
  doctorName?: string;
  clinicName?: string;
  clinicPhone?: string;
};

const WEEKDAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];
const MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

// "শনিবার, ২৫ অক্টোবর ২০২৫, সকাল ১০:৩০" (full names, unlike on screen).
export const bengaliDateTime = (date: Date) =>
  `${WEEKDAYS[date.getDay()]}, ${bengaliDigits(date.getDate())} ${
    MONTHS[date.getMonth()]
  } ${bengaliDigits(date.getFullYear())}, ${clockTime(
    date.getHours() * 60 + date.getMinutes(),
    'bn',
  )}`;

const firstNameOf = (patientName: string) => patientName.trim().split(/\s+/)[0];

// "Hi Ankita, your appointment with Dr. Subhas Middya at Smile Dental Clinic is on
//  Sat, 25 Oct 2025 at 10:30 AM. Reply or call +91 98765 00000 to reschedule."
const englishMessage = ({
  patientName,
  startsAt,
  doctorName,
  clinicName,
  clinicPhone,
}: MessageInput) => {
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
  return `Hi ${firstNameOf(
    patientName,
  )}, your appointment${withWhom} is on ${when}. ${reschedule}`;
};

// Names stay as typed; the clinic phone keeps Western digits so the patient's
// phone still recognises it as a number to tap and call:
// "প্রিয় Ankita, Smile Dental Clinic-এ Dr. Subhas Middya-এর কাছে আপনার
//  অ্যাপয়েন্টমেন্ট শনিবার, ২৫ অক্টোবর ২০২৫, সকাল ১০:৩০-এ নির্ধারিত হয়েছে।
//  সময় বদলাতে চাইলে +91 98765 00000 নম্বরে ফোন করুন বা এই মেসেজের উত্তর দিন।"
// Bengali texts go as Unicode SMS (70 characters a part), so this is sent as
// a few joined parts.
const bengaliMessage = ({
  patientName,
  startsAt,
  doctorName,
  clinicName,
  clinicPhone,
}: MessageInput) => {
  const withWhom = [
    clinicName && `${clinicName}-এ`,
    doctorName && `${doctorName}-এর কাছে`,
  ]
    .filter(Boolean)
    .map(part => `${part} `)
    .join('');
  const reschedule = clinicPhone
    ? `সময় বদলাতে চাইলে ${clinicPhone} নম্বরে ফোন করুন বা এই মেসেজের উত্তর দিন।`
    : 'সময় বদলাতে চাইলে এই মেসেজের উত্তর দিন।';
  return `প্রিয় ${firstNameOf(
    patientName,
  )}, ${withWhom}আপনার অ্যাপয়েন্টমেন্ট ${bengaliDateTime(
    startsAt,
  )}-এ নির্ধারিত হয়েছে। ${reschedule}`;
};

// The appointment text sent to the patient, in the app's language (Settings ›
// Language), dropping whatever the doctor hasn't filled in yet.
export const appointmentMessage = (
  input: MessageInput,
  language: Language = getLanguage(),
) => (language === 'bn' ? bengaliMessage(input) : englishMessage(input));

// SmsManager takes digits with an optional leading "+".
export const smsNumber = (phone: string) => phone.replace(/[^\d+]/g, '');

// wa.me wants the full international number, digits only.
export const whatsAppNumber = (phone: string) => {
  const digits = phoneDigits(phone);
  return digits.length === 10 ? DEFAULT_COUNTRY_CODE + digits : digits;
};
