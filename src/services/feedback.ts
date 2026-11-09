import {NativeModules} from 'react-native';

// android/app/src/main/java/com/smiledental/doctor/feedback/FeedbackModule.kt
const {PickerFeedback} = NativeModules as {
  PickerFeedback?: {tick: () => void};
};

const MIN_GAP_MS = 25;
let last = 0;

// The light "tick" (vibration + click sound) as a wheel passes each row or a
// date is picked. Follows the phone's Touch sounds / Touch vibration settings.
// A fast flick passes many rows a frame apart, so ticks are spaced out a little
// to stay crisp instead of becoming one long buzz.
export const tick = () => {
  const now = Date.now();
  if (now - last < MIN_GAP_MS) {
    return;
  }
  last = now;
  PickerFeedback?.tick();
};
