import {defineStrings} from '../index';

// Sending the appointment SMS from the doctor's SIM.
export const smsText = defineStrings({
  failedTitle: 'SMS not sent',
  failedBody:
    'The phone couldn’t send the text. Check the SIM and signal, or send it from Messages.',
  blockedTitle: 'SMS permission is off',
  blockedBody:
    'Turn on SMS for Smile Doctor in Settings to send texts automatically, or send this one from Messages.',
  openSettings: 'Open Settings',
  openSettingsFailed: 'Couldn’t open Settings',
  openSettingsFallback: 'Open Settings › Apps › Smile Doctor on your phone.',
  cancel: 'Cancel',
  openMessages: 'Open Messages',
  openMessagesFailed: 'Couldn’t open Messages',
  noMessagesApp: 'No messaging app was found on this phone.',
})({
  failedTitle: 'SMS পাঠানো যায়নি',
  failedBody:
    'ফোন থেকে মেসেজ পাঠানো গেল না। SIM ও নেটওয়ার্ক দেখুন, অথবা Messages অ্যাপ থেকে পাঠান।',
  blockedTitle: 'SMS-এর অনুমতি বন্ধ আছে',
  blockedBody:
    'নিজে থেকে মেসেজ পাঠাতে সেটিংসে Smile Doctor-এর SMS অনুমতি চালু করুন, অথবা এটি Messages অ্যাপ থেকে পাঠান।',
  openSettings: 'সেটিংস খুলুন',
  openSettingsFailed: 'সেটিংস খোলা গেল না',
  openSettingsFallback: 'ফোনের Settings › Apps › Smile Doctor খুলুন।',
  cancel: 'বাতিল',
  openMessages: 'Messages খুলুন',
  openMessagesFailed: 'Messages খোলা গেল না',
  noMessagesApp: 'এই ফোনে কোনো মেসেজিং অ্যাপ পাওয়া যায়নি।',
});
