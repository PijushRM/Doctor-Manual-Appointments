import {defineStrings} from '../index';

// Changing an appointment's time (from a patient's Activity).
export const rescheduleText = defineStrings({
  changeTime: 'Change time',
  changeTimeFor: (when: string) => `Change time of the appointment on ${when}`,
  back: 'Back to patient',
  titleStart: 'Change',
  titleAccent: 'time',
  currentlyAt: (when: string) => `Now: ${when}`,
  saveNewTime: 'Save new time',
  saving: 'Saving…',
  saveFailed: 'Couldn’t change the time',
  movedTitle: 'Time changed',
  movedBody: (name: string, when: string) =>
    `${name}’s appointment is now ${when}. Send them an SMS with the new time?`,
  notNow: 'Not now',
  sendSms: 'Send SMS',
  smsFailed: 'Couldn’t send the SMS',
})({
  changeTime: 'সময় বদলান',
  changeTimeFor: (when: string) => `${when}-এর অ্যাপয়েন্টমেন্টের সময় বদলান`,
  back: 'রোগীর পাতায় ফিরুন',
  titleStart: 'সময়',
  titleAccent: 'বদলান',
  currentlyAt: (when: string) => `এখন: ${when}`,
  saveNewTime: 'নতুন সময় সংরক্ষণ করুন',
  saving: 'সংরক্ষণ হচ্ছে…',
  saveFailed: 'সময় বদলানো গেল না',
  movedTitle: 'সময় বদলানো হয়েছে',
  movedBody: (name: string, when: string) =>
    `${name}-এর অ্যাপয়েন্টমেন্ট এখন ${when}। নতুন সময় জানিয়ে SMS পাঠাবেন?`,
  notNow: 'এখন নয়',
  sendSms: 'SMS পাঠান',
  smsFailed: 'SMS পাঠানো গেল না',
});
