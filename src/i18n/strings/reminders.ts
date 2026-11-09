import {bengaliDigits} from '../format';
import {defineStrings} from '../index';

// Appointment reminder notifications.
export const remindersText = defineStrings({
  channel: 'Appointment reminders',
  title: (minutes: number) => `Appointment in ${minutes} minutes`,
  body: (name: string, age: number, time: string) =>
    `${name} · ${age} yrs · ${time}`,
})({
  channel: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার',
  title: (minutes: number) =>
    `${bengaliDigits(minutes)} মিনিট পরে অ্যাপয়েন্টমেন্ট`,
  body: (name: string, age: number, time: string) =>
    `${name} · ${bengaliDigits(age)} বছর · ${time}`,
});
