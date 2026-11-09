import {bengaliDigits as bn} from '../format';
import {defineStrings} from '../index';

// New Appointment (patient details, date & time), the calendar and time
// sheets, "Appointment saved", and the Home day groups.
export const appointmentsText = defineStrings({
  // Part 1: patient details
  backToPatients: 'Back to my patients',
  titleStart: 'New',
  titleAccent: 'appointment',
  intro:
    "Start with the patient's details. You'll pick the date and time next.",
  patientDetails: 'Patient details',
  fullName: 'Full name',
  fullNamePlaceholder: 'e.g. Amit Das',
  age: 'Age',
  agePlaceholder: 'e.g. 34',
  phone: 'Phone number',
  phonePlaceholder: 'e.g. 98300 12345',
  email: 'Email (optional)',
  emailPlaceholder: 'e.g. amit@gmail.com',
  alreadyPatient: (name: string) =>
    `Already a patient — this appointment will be added to ${name}'s record.`,
  nextDateTime: 'Next: date & time',
  // Form checks
  errName: 'Enter the patient’s full name.',
  errAge: (max: number) => `Age 0–${max}`,
  errPhone: 'Enter a valid phone number.',
  errEmail: 'Enter a valid email or leave it blank.',

  // Part 2: date & time
  backToDetails: 'Back to patient details',
  dateTitleStart: 'Date &',
  dateTitleAccent: 'time',
  date: 'Date',
  openCalendar: (month: string) => `Open calendar, ${month}`,
  time: 'Time',
  scrollOrTap: 'SCROLL OR TAP',
  freeSoon: 'Free soon:',
  setTimeTo: (time: string) => `Set time to ${time}`,
  saving: 'Saving…',
  saveAppointment: 'Save appointment',
  saveFailed: 'Couldn’t save the appointment',
  notePassed: (time: string) =>
    `${time} has already passed — pick a later time.`,
  noteClash: (time: string) =>
    `${time} overlaps a booking — pick another time.`,
  noteClosed: (weekday: string) => `Clinic is closed on ${weekday}s.`,
  noteBooked: (times: string) => `Booked this day: ${times}`,
  noteNone: 'No bookings yet this day.',

  // Time wheel
  hour: 'Hour',
  minute: 'Minute',
  amPm: 'AM or PM',
  am: 'AM',
  pm: 'PM',
  scrollOrTapTime: 'Scroll or tap a time',
  done: 'Done',

  // Calendar
  chooseDate: 'Choose a date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  hasAppointments: 'has appointments',
  today: 'today',
  calendarLegend: 'Has appointments · outlined = today',
  // Sunday first, like Date#getDay
  weekdayInitials: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  // Appointment saved
  savedTitleStart: 'Appointment',
  savedTitleAccent: 'added',
  onYourList: (name: string) => `${name} is now on your patient list.`,
  years: (age: string) => `${age} years`,
  dateTime: 'Date & time',
  doctor: 'Doctor',
  phoneLabel: 'Phone',
  emailLabel: 'Email',
  sendToPatient: 'SEND DETAILS TO PATIENT',
  channelSms: 'SMS',
  channelWhatsApp: 'WhatsApp',
  channelFacebook: 'Facebook',
  channelOff: (channel: string) => `${channel}: not available`,
  channelSent: (channel: string) => `${channel}: sent`,
  sendBy: (channel: string) => `Send by ${channel}`,
  sendFailed: (channel: string) => `Couldn’t send by ${channel}`,
  smsFailed: 'The message wasn’t sent. Please try again.',
  whatsAppFailed: 'Couldn’t open WhatsApp or the browser on this phone.',
  shareFailed: 'Couldn’t open the share menu. Please try again.',
  viewPatients: 'View my patients',
  addAnother: 'Add another appointment',

  // Home day groups
  todayGroup: (day: string) => `TODAY, ${day}`,
  earlier: 'EARLIER · ',
  patientCount: (count: number) =>
    `${count} ${count === 1 ? 'patient' : 'patients'}`,
  yrsAt: (age: number, time: string) => `${age} yrs · ${time}`,
})({
  // Part 1: patient details
  backToPatients: 'আমার রোগীদের তালিকায় ফিরুন',
  titleStart: 'নতুন',
  titleAccent: 'অ্যাপয়েন্টমেন্ট',
  intro: 'প্রথমে রোগীর তথ্য দিন। এরপর তারিখ ও সময় বেছে নেবেন।',
  patientDetails: 'রোগীর তথ্য',
  fullName: 'পুরো নাম',
  fullNamePlaceholder: 'যেমন Amit Das',
  age: 'বয়স',
  agePlaceholder: 'যেমন ৩৪',
  phone: 'ফোন নম্বর',
  phonePlaceholder: 'যেমন 98300 12345',
  email: 'ইমেল (ঐচ্ছিক)',
  emailPlaceholder: 'যেমন amit@gmail.com',
  alreadyPatient: (name: string) =>
    `ইনি আগে থেকেই রোগী — এই অ্যাপয়েন্টমেন্ট ${name}-এর রেকর্ডে যোগ হবে।`,
  nextDateTime: 'পরবর্তী: তারিখ ও সময়',
  // Form checks
  errName: 'রোগীর পুরো নাম লিখুন।',
  errAge: (max: number) => `বয়স ০–${bn(max)}`,
  errPhone: 'সঠিক ফোন নম্বর লিখুন।',
  errEmail: 'সঠিক ইমেল লিখুন, অথবা খালি রাখুন।',

  // Part 2: date & time
  backToDetails: 'রোগীর তথ্যে ফিরুন',
  dateTitleStart: 'তারিখ ও',
  dateTitleAccent: 'সময়',
  date: 'তারিখ',
  openCalendar: (month: string) => `ক্যালেন্ডার খুলুন, ${month}`,
  time: 'সময়',
  scrollOrTap: 'স্ক্রোল বা ট্যাপ করুন',
  freeSoon: 'শীঘ্রই খালি:',
  setTimeTo: (time: string) => `সময় ${time} করুন`,
  saving: 'সংরক্ষণ হচ্ছে…',
  saveAppointment: 'অ্যাপয়েন্টমেন্ট সংরক্ষণ করুন',
  saveFailed: 'অ্যাপয়েন্টমেন্ট সংরক্ষণ করা গেল না',
  notePassed: (time: string) =>
    `${time} পেরিয়ে গেছে — পরের কোনো সময় বেছে নিন।`,
  noteClash: (time: string) =>
    `${time}-এ অন্য একটি বুকিং আছে — অন্য সময় বেছে নিন।`,
  noteClosed: (weekday: string) => `${weekday} ক্লিনিক বন্ধ থাকে।`,
  noteBooked: (times: string) => `এই দিনের বুকিং: ${times}`,
  noteNone: 'এই দিনে এখনও কোনো বুকিং নেই।',

  // Time wheel
  hour: 'ঘণ্টা',
  minute: 'মিনিট',
  amPm: 'পূর্বাহ্ণ বা অপরাহ্ণ',
  am: 'পূর্বাহ্ণ',
  pm: 'অপরাহ্ণ',
  scrollOrTapTime: 'স্ক্রোল করে বা ট্যাপ করে সময় বেছে নিন',
  done: 'হয়ে গেছে',

  // Calendar
  chooseDate: 'একটি তারিখ বেছে নিন',
  previousMonth: 'আগের মাস',
  nextMonth: 'পরের মাস',
  hasAppointments: 'অ্যাপয়েন্টমেন্ট আছে',
  today: 'আজ',
  calendarLegend: 'অ্যাপয়েন্টমেন্ট আছে · বৃত্ত = আজ',
  weekdayInitials: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],

  // Appointment saved
  savedTitleStart: 'অ্যাপয়েন্টমেন্ট',
  savedTitleAccent: 'যোগ হয়েছে',
  onYourList: (name: string) => `${name} এখন আপনার রোগীর তালিকায় আছেন।`,
  years: (age: string) => `${bn(age)} বছর`,
  dateTime: 'তারিখ ও সময়',
  doctor: 'ডাক্তার',
  phoneLabel: 'ফোন',
  emailLabel: 'ইমেল',
  sendToPatient: 'রোগীকে বিবরণ পাঠান',
  channelSms: 'SMS',
  channelWhatsApp: 'WhatsApp',
  channelFacebook: 'Facebook',
  channelOff: (channel: string) => `${channel}: এখন পাওয়া যাচ্ছে না`,
  channelSent: (channel: string) => `${channel}: পাঠানো হয়েছে`,
  sendBy: (channel: string) => `${channel}-এ পাঠান`,
  sendFailed: (channel: string) => `${channel}-এ পাঠানো গেল না`,
  smsFailed: 'মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।',
  whatsAppFailed: 'এই ফোনে WhatsApp বা ব্রাউজার খোলা গেল না।',
  shareFailed: 'শেয়ার মেনু খোলা গেল না। আবার চেষ্টা করুন।',
  viewPatients: 'আমার রোগীদের দেখুন',
  addAnother: 'আরেকটি অ্যাপয়েন্টমেন্ট যোগ করুন',

  // Home day groups
  todayGroup: (day: string) => `আজ, ${day}`,
  earlier: 'আগের · ',
  patientCount: (count: number) => `${bn(count)} জন রোগী`,
  yrsAt: (age: number, time: string) => `${bn(age)} বছর · ${time}`,
});
