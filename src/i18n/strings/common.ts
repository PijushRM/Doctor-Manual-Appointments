import {defineStrings} from '../index';

// Shared UI: tab bar, step header, sheets, weekday names.
export const commonText = defineStrings({
  tabHome: 'Home',
  tabAppointments: 'Appointments',
  tabPatients: 'Patients',
  tabProfile: 'Profile',
  // "Part 1 of 2" (digits already in the current language)
  partOf: (part: string, total: string) => `Part ${part} of ${total}`,
  // Screen reader label for a sheet's backdrop: "Close choose language"
  closeSheet: (label: string) => `Close ${label.toLowerCase()}`,
  // Sunday first (Date#getDay order)
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysLong: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  // One-letter chips on Edit Profile's working days
  weekdaysLetter: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
})({
  tabHome: 'হোম',
  tabAppointments: 'অ্যাপয়েন্টমেন্ট',
  tabPatients: 'রোগী',
  tabProfile: 'প্রোফাইল',
  partOf: (part: string, total: string) => `ধাপ ${part}/${total}`,
  closeSheet: (label: string) => `${label} বন্ধ করুন`,
  weekdaysShort: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'],
  weekdaysLong: [
    'রবিবার',
    'সোমবার',
    'মঙ্গলবার',
    'বুধবার',
    'বৃহস্পতিবার',
    'শুক্রবার',
    'শনিবার',
  ],
  weekdaysLetter: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],
});
