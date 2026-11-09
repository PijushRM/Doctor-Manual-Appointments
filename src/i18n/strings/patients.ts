import {defineStrings} from '../index';

// Patients tab: list, patient profile, activity timeline, Upload / Add note.
export const patientsText = defineStrings({
  // Patient list
  titleStart: 'Pat',
  titleAccent: 'ients',
  patientCount: (n: string, one: boolean) =>
    `${n} ${one ? 'PATIENT' : 'PATIENTS'}`,
  searchPlaceholder: 'Search name or phone',
  searchLabel: 'Search patients',
  sorted: 'SORTED BY LAST ACTIVITY',
  noMatch: (query: string) => `No patients match “${query}”.`,
  noPatients: 'No patients yet. Add an appointment to start your list.',
  ageShort: (age: string) => `${age} yrs`,
  rowLabel: (name: string, age: string, activity: string, when: string) =>
    `${name}, ${age} years. ${activity}, ${when}`,

  // Patient profile
  backToPatients: 'Back to patients',
  profileTag: 'PATIENT PROFILE',
  facts: (age: string, since: string) =>
    `${age} YRS · PATIENT SINCE ${since.toUpperCase()}`,
  nextVisit: 'Next visit: ',
  noneBooked: 'None booked',
  upload: 'Upload',
  addNote: 'Add note',
  activity: 'Activity',
  newestFirst: 'NEWEST FIRST',
  newTag: 'New',
  newA11y: 'new',
  justNow: 'Just now',
  opensFile: 'Opens the file',
  notePrefix: 'Note: ',
  sendSmsAction: 'Send appointment SMS',
  smsSent: 'Appointment SMS sent',
  sendSmsTo: (name: string) => `Send appointment SMS to ${name}`,
  smsConfirmTitle: (name: string) => `Text ${name}?`,
  smsConfirmBody: (when: string, phone: string) =>
    `Sends the appointment details for ${when} to ${phone}.`,
  cancel: 'Cancel',
  sendSms: 'Send SMS',
  smsFailed: 'Couldn’t send the SMS',
  openFileFailed: 'Can’t open this file',

  // Activity timeline
  addedByYou: 'Added by you',
  appointmentBooked: 'Appointment booked',
  bookedFor: 'Booked for ',
  visit: 'Visit',
  noteAdded: 'Note added',
  yesterday: 'Yesterday',

  // Record entries
  typePrescription: 'Prescription',
  typeReport: 'Report',
  typeXray: 'X-ray / Photo',
  typeOther: 'Other',
  typeNote: 'Note only',
  nounPrescription: 'Prescription',
  nounReport: 'Report',
  nounXray: 'X-ray / photo',
  nounOther: 'File',
  nounNote: 'Note',
  uploaded: (noun: string) => `${noun} uploaded`,
  saveNote: 'Save note',
  uploadType: (label: string) => `Upload ${label.toLowerCase()}`,
  addedTo: (noun: string, firstName: string) =>
    `${noun} added to ${firstName}'s activity`,
  errorFile: 'Add a photo or file first.',
  errorNote: 'Write the note first.',
  kb: (n: string) => `${n} KB`,
  mb: (n: string) => `${n} MB`,

  // Upload / Add note screen
  backToProfile: 'Back to patient profile',
  addTo: 'Add to ',
  record: 'record',
  type: 'TYPE',
  removeFile: 'Remove file',
  dropHint: 'Add a photo or file (PDF, JPG, PNG)',
  camera: 'Camera',
  chooseFile: 'Choose file',
  note: 'Note',
  notePlaceholder:
    'e.g. Amoxicillin 500 mg, 3× a day for 5 days. Take after food.',
  required: 'REQUIRED',
  optional: 'OPTIONAL',
  readyToUpload: (size: string) => `${size} · ready to upload`,
  footnote: (firstName: string) =>
    `This will appear in ${firstName}'s activity with today's date and time.`,
  saving: 'Saving…',
  fileTooLarge: 'File too large',
  addFileFailed: 'Couldn’t add the file',
  saveNoteFailed: 'Couldn’t save the note',
  saveFileFailed: 'Couldn’t save the file',
})({
  // Patient list
  titleStart: 'রো',
  titleAccent: 'গী',
  patientCount: (n: string) => `${n} জন রোগী`,
  searchPlaceholder: 'নাম বা ফোন নম্বর খুঁজুন',
  searchLabel: 'রোগী খুঁজুন',
  sorted: 'শেষ কাজ অনুযায়ী সাজানো',
  noMatch: (query: string) => `“${query}”-এর সাথে কোনো রোগী মেলেনি।`,
  noPatients:
    'এখনও কোনো রোগী নেই। একটি অ্যাপয়েন্টমেন্ট যোগ করে তালিকা শুরু করুন।',
  ageShort: (age: string) => `${age} বছর`,
  rowLabel: (name: string, age: string, activity: string, when: string) =>
    `${name}, ${age} বছর। ${activity}, ${when}`,

  // Patient profile
  backToPatients: 'রোগীদের তালিকায় ফিরুন',
  profileTag: 'রোগীর প্রোফাইল',
  facts: (age: string, since: string) => `${age} বছর · রোগী ${since} থেকে`,
  nextVisit: 'পরের ভিজিট: ',
  noneBooked: 'কোনো বুকিং নেই',
  upload: 'আপলোড',
  addNote: 'নোট যোগ করুন',
  activity: 'কার্যকলাপ',
  newestFirst: 'নতুন আগে',
  newTag: 'নতুন',
  newA11y: 'নতুন',
  justNow: 'এইমাত্র',
  opensFile: 'ফাইলটি খোলে',
  notePrefix: 'নোট: ',
  sendSmsAction: 'অ্যাপয়েন্টমেন্টের SMS পাঠান',
  smsSent: 'অ্যাপয়েন্টমেন্টের SMS পাঠানো হয়েছে',
  sendSmsTo: (name: string) => `${name}-কে অ্যাপয়েন্টমেন্টের SMS পাঠান`,
  smsConfirmTitle: (name: string) => `${name}-কে SMS পাঠাবেন?`,
  smsConfirmBody: (when: string, phone: string) =>
    `${when}-এর অ্যাপয়েন্টমেন্টের তথ্য ${phone} নম্বরে পাঠানো হবে।`,
  cancel: 'বাতিল',
  sendSms: 'SMS পাঠান',
  smsFailed: 'SMS পাঠানো গেল না',
  openFileFailed: 'ফাইলটি খোলা যাচ্ছে না',

  // Activity timeline
  addedByYou: 'আপনি যোগ করেছেন',
  appointmentBooked: 'অ্যাপয়েন্টমেন্ট বুক হয়েছে',
  bookedFor: 'বুক করা হয়েছে: ',
  visit: 'ভিজিট',
  noteAdded: 'নোট যোগ হয়েছে',
  yesterday: 'গতকাল',

  // Record entries
  typePrescription: 'প্রেসক্রিপশন',
  typeReport: 'রিপোর্ট',
  typeXray: 'এক্স-রে / ছবি',
  typeOther: 'অন্যান্য',
  typeNote: 'শুধু নোট',
  nounPrescription: 'প্রেসক্রিপশন',
  nounReport: 'রিপোর্ট',
  nounXray: 'এক্স-রে / ছবি',
  nounOther: 'ফাইল',
  nounNote: 'নোট',
  uploaded: (noun: string) => `${noun} আপলোড হয়েছে`,
  saveNote: 'নোট সেভ করুন',
  uploadType: (label: string) => `${label} আপলোড করুন`,
  addedTo: (noun: string, firstName: string) =>
    `${firstName}-এর কার্যকলাপে ${noun} যোগ হয়েছে`,
  errorFile: 'আগে একটি ছবি বা ফাইল যোগ করুন।',
  errorNote: 'আগে নোটটি লিখুন।',
  kb: (n: string) => `${n} KB`,
  mb: (n: string) => `${n} MB`,

  // Upload / Add note screen
  backToProfile: 'রোগীর প্রোফাইলে ফিরুন',
  addTo: 'রেকর্ডে ',
  record: 'যোগ করুন',
  type: 'ধরন',
  removeFile: 'ফাইল সরান',
  dropHint: 'একটি ছবি বা ফাইল যোগ করুন (PDF, JPG, PNG)',
  camera: 'ক্যামেরা',
  chooseFile: 'ফাইল বেছে নিন',
  note: 'নোট',
  notePlaceholder:
    'যেমন: Amoxicillin 500 mg, দিনে ৩ বার, ৫ দিন। খাবারের পরে খাবেন।',
  required: 'আবশ্যক',
  optional: 'ঐচ্ছিক',
  readyToUpload: (size: string) => `${size} · আপলোডের জন্য তৈরি`,
  footnote: (firstName: string) =>
    `এটি আজকের তারিখ ও সময় সহ ${firstName}-এর কার্যকলাপে দেখা যাবে।`,
  saving: 'সেভ হচ্ছে…',
  fileTooLarge: 'ফাইলটি খুব বড়',
  addFileFailed: 'ফাইল যোগ করা গেল না',
  saveNoteFailed: 'নোট সেভ করা গেল না',
  saveFileFailed: 'ফাইল সেভ করা গেল না',
});
