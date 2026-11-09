import {defineStrings} from '../index';

// Home tab ("My patients") and the shared header / patient rows / stat cards.
export const homeText = defineStrings({
  titleStart: 'My ',
  titleAccent: 'patients',
  underYourCare: 'UNDER YOUR CARE',
  today: 'TODAY',
  tabToday: 'Today',
  tabUpcoming: 'Upcoming',
  tabAll: 'All',
  emptyToday: 'No appointments today.',
  emptyUpcoming: 'No upcoming appointments.',
  emptyAll: 'No appointments yet.',
  addAppointment: 'Add appointment',
  doctor: 'Doctor',
  newTag: 'New',
  newA11y: ', new',
})({
  titleStart: 'আমার ',
  titleAccent: 'রোগী',
  underYourCare: 'আপনার চিকিৎসাধীন',
  today: 'আজ',
  tabToday: 'আজ',
  tabUpcoming: 'আসন্ন',
  tabAll: 'সব',
  emptyToday: 'আজ কোনো অ্যাপয়েন্টমেন্ট নেই।',
  emptyUpcoming: 'কোনো আসন্ন অ্যাপয়েন্টমেন্ট নেই।',
  emptyAll: 'এখনও কোনো অ্যাপয়েন্টমেন্ট নেই।',
  addAppointment: 'অ্যাপয়েন্টমেন্ট যোগ করুন',
  doctor: 'ডাক্তার',
  newTag: 'নতুন',
  newA11y: ', নতুন',
});
