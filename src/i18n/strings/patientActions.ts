import {defineStrings} from '../index';

// Patient profile actions: edit, delete, book next, absent.
export const patientActionsText = defineStrings({
  // Profile buttons
  bookNext: 'Book next appointment',
  editPatient: 'Edit patient',
  // Appointment row menu
  moreFor: (when: string) => `Options for the appointment on ${when}`,
  markAbsent: 'Mark absent',
  markAbsentHint: 'Didn’t come. Frees the time slot.',
  undoAbsent: 'Mark as came',
  undoAbsentHint: 'Undo “Absent”. Takes the time slot again.',
  changeTime: 'Change time',
  cancel: 'Cancel',
  absentFailed: 'Couldn’t update the appointment',
  // Edit patient screen
  back: 'Back to patient',
  titleStart: 'Edit',
  titleAccent: 'patient',
  save: 'Save changes',
  saving: 'Saving…',
  saveFailed: 'Couldn’t save the patient',
  // Delete
  deletePatient: 'Delete patient',
  deleteTitle: (name: string) => `Delete ${name}?`,
  deleteBody:
    'They disappear from your patients and their upcoming appointments are cancelled. Their history is kept, and booking them again with the same name and phone brings it back.',
  delete: 'Delete',
  deleting: 'Deleting…',
  deleteFailed: 'Couldn’t delete the patient',
})({
  bookNext: 'পরের অ্যাপয়েন্টমেন্ট বুক করুন',
  editPatient: 'রোগীর তথ্য বদলান',
  moreFor: (when: string) => `${when}-এর অ্যাপয়েন্টমেন্টের বিকল্প`,
  markAbsent: 'অনুপস্থিত চিহ্নিত করুন',
  markAbsentHint: 'আসেননি। সময়টি খালি হয়ে যাবে।',
  undoAbsent: 'এসেছিলেন চিহ্নিত করুন',
  undoAbsentHint: '“অনুপস্থিত” বাতিল। সময়টি আবার বুক হবে।',
  changeTime: 'সময় বদলান',
  cancel: 'বাতিল',
  absentFailed: 'অ্যাপয়েন্টমেন্ট আপডেট করা গেল না',
  back: 'রোগীর পাতায় ফিরুন',
  titleStart: 'রোগীর তথ্য',
  titleAccent: 'বদলান',
  save: 'পরিবর্তন সংরক্ষণ করুন',
  saving: 'সংরক্ষণ হচ্ছে…',
  saveFailed: 'রোগীর তথ্য সংরক্ষণ করা গেল না',
  deletePatient: 'রোগী মুছে ফেলুন',
  deleteTitle: (name: string) => `${name}-কে মুছে ফেলবেন?`,
  deleteBody:
    'আপনার রোগীর তালিকা থেকে সরে যাবে এবং আগামী অ্যাপয়েন্টমেন্টগুলো বাতিল হবে। পুরনো ইতিহাস রাখা থাকবে; একই নাম ও ফোনে আবার বুক করলে তা ফিরে আসবে।',
  delete: 'মুছে ফেলুন',
  deleting: 'মুছে ফেলা হচ্ছে…',
  deleteFailed: 'রোগী মুছে ফেলা গেল না',
});
