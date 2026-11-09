package com.smiledental.doctor.feedback

import android.os.Build
import android.view.HapticFeedbackConstants
import android.view.SoundEffectConstants
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

/**
 * The scroll-wheel "tick": a light vibration and the system click sound, the
 * same feedback Android's own pickers give. Both follow the phone's settings
 * (Touch sounds, Touch vibration), so they stay off when the doctor turned
 * them off. No permission is needed.
 */
class FeedbackModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

  override fun getName() = NAME

  @ReactMethod
  fun tick() {
    UiThreadUtil.runOnUiThread {
      val view = context.currentActivity?.window?.decorView ?: return@runOnUiThread
      view.performHapticFeedback(
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
              HapticFeedbackConstants.SEGMENT_FREQUENT_TICK
          else HapticFeedbackConstants.CLOCK_TICK)
      view.playSoundEffect(SoundEffectConstants.CLICK)
    }
  }

  companion object {
    const val NAME = "PickerFeedback"
  }
}
