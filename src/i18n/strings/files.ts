import {defineStrings} from '../index';

// Picking, uploading and opening files and photos.
export const filesText = defineStrings({
  tooLarge: (limit: string, size: string) =>
    `Files must be ${limit} or smaller. This one is ${size}.`,
  cameraUnavailable: 'The camera isn’t available on this phone right now.',
  photoPermission:
    'Smile Doctor isn’t allowed to use the camera or photos. Allow it in Settings › Apps › Smile Doctor.',
  photoFailed: 'Couldn’t get the photo. Please try again.',
  wrongType: 'This kind of file can’t be added. Choose a PDF, JPG or PNG.',
  fileFailed: 'Couldn’t get the file. Please try again.',
  notOnServer: 'This file isn’t on the server.',
  noViewer:
    'No app on this phone can open it. Install a PDF or photo viewer and try again.',
  closePhoto: (label: string) => `Close ${label.toLowerCase()}`,
  photoLoadFailed:
    'Couldn’t load the photo. Check your internet and try again.',
})({
  tooLarge: (limit: string, size: string) =>
    `ফাইল ${limit} বা তার ছোট হতে হবে। এই ফাইলটি ${size}।`,
  cameraUnavailable: 'এই ফোনের ক্যামেরা এখন পাওয়া যাচ্ছে না।',
  photoPermission:
    'Smile Doctor-কে ক্যামেরা বা ছবি ব্যবহারের অনুমতি দেওয়া নেই। Settings › Apps › Smile Doctor-এ গিয়ে অনুমতি দিন।',
  photoFailed: 'ছবিটি নেওয়া গেল না। আবার চেষ্টা করুন।',
  wrongType: 'এই ধরনের ফাইল যোগ করা যায় না। PDF, JPG বা PNG বেছে নিন।',
  fileFailed: 'ফাইলটি নেওয়া গেল না। আবার চেষ্টা করুন।',
  notOnServer: 'এই ফাইলটি সার্ভারে নেই।',
  noViewer:
    'এই ফোনে এটি খোলার মতো কোনো অ্যাপ নেই। একটি PDF বা ছবি দেখার অ্যাপ ইনস্টল করে আবার চেষ্টা করুন।',
  closePhoto: (label: string) => `${label} বন্ধ করুন`,
  photoLoadFailed: 'ছবিটি লোড করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
});
