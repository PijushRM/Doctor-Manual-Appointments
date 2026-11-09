import {format} from 'date-fns';
import {bn} from 'date-fns/locale';
import {getLanguage} from './language';

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯';

export const bengaliDigits = (text: string | number) =>
  String(text).replace(/\d/g, d => BENGALI_DIGITS[Number(d)]);

// Numbers in the current language's digits: 25 → ২৫ in Bengali.
export const localDigits = (text: string | number) =>
  getLanguage() === 'bn' ? bengaliDigits(text) : String(text);

// date-fns `format` in the current language: Bengali day and month names and
// digits ("শনি, ২৫ অক্টো"). Use this for every date the doctor sees.
export const formatDate = (date: Date, pattern: string) =>
  getLanguage() === 'bn'
    ? bengaliDigits(format(date, pattern, {locale: bn}))
    : format(date, pattern);

// Bengali names the part of the day instead of AM/PM.
export const bengaliPartOfDay = (hour: number) =>
  hour >= 4 && hour < 12
    ? 'সকাল'
    : hour >= 12 && hour < 15
    ? 'দুপুর'
    : hour >= 15 && hour < 18
    ? 'বিকেল'
    : hour >= 18 && hour < 20
    ? 'সন্ধ্যা'
    : 'রাত';

// A clock time from minutes after midnight: "10:30 AM" / "সকাল ১০:৩০".
export const clockTime = (minutes: number, language = getLanguage()) => {
  const h24 = Math.floor(minutes / 60);
  const clock = `${h24 % 12 || 12}:${String(minutes % 60).padStart(2, '0')}`;
  return language === 'bn'
    ? `${bengaliPartOfDay(h24)} ${bengaliDigits(clock)}`
    : `${clock} ${h24 >= 12 ? 'PM' : 'AM'}`;
};
