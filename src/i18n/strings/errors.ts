import {defineStrings} from '../index';

// Why something failed: network, server and general errors.
export const errorText = defineStrings({
  offline: 'Can’t reach the server. Check your internet and try again.',
  timeout:
    'The server is taking too long to answer. Check your internet and try again.',
  server: 'Something went wrong on our side. Please try again.',
  unavailable:
    'The server isn’t available right now. Please try again in a few minutes.',
  unexpected:
    'The server sent an answer the app doesn’t understand. Please try again.',
  generic: 'Something went wrong. Please try again.',
  sessionExpired: 'Your session has expired. Please log in again.',
  forbidden: 'You don’t have permission to do this.',
  notFound: 'This was not found. It may have been deleted.',
  tooLargeForServer: 'This file is too large for the server.',
  tooManyAttempts: 'Too many attempts. Please wait a minute and try again.',
  checkDetails: 'Please check the details and try again.',
  crashTitle: 'Something went wrong',
  crashScreenBody:
    'This screen ran into a problem. Your patients and appointments are safe on the server.',
  tryAgain: 'Try again',
})({
  offline: 'সার্ভারে পৌঁছানো যাচ্ছে না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
  timeout:
    'সার্ভার উত্তর দিতে অনেক সময় নিচ্ছে। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
  server: 'আমাদের দিকে একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  unavailable:
    'সার্ভার এখন পাওয়া যাচ্ছে না। কয়েক মিনিট পরে আবার চেষ্টা করুন।',
  unexpected:
    'সার্ভার এমন উত্তর দিয়েছে যা অ্যাপ বুঝতে পারছে না। আবার চেষ্টা করুন।',
  generic: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।',
  sessionExpired: 'আপনার সেশনের মেয়াদ শেষ। আবার লগ ইন করুন।',
  forbidden: 'এটি করার অনুমতি আপনার নেই।',
  notFound: 'এটি পাওয়া যায়নি। হয়তো মুছে ফেলা হয়েছে।',
  tooLargeForServer: 'ফাইলটি সার্ভারের জন্য খুব বড়।',
  tooManyAttempts:
    'অনেকবার চেষ্টা হয়েছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।',
  checkDetails: 'তথ্যগুলো দেখে আবার চেষ্টা করুন।',
  crashTitle: 'কিছু একটা ভুল হয়েছে',
  crashScreenBody:
    'এই স্ক্রিনে একটি সমস্যা হয়েছে। আপনার রোগী ও অ্যাপয়েন্টমেন্ট সার্ভারে নিরাপদ আছে।',
  tryAgain: 'আবার চেষ্টা করুন',
});
