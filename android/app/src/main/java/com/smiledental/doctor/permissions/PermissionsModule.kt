package com.smiledental.doctor.permissions

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * React Native's PermissionsAndroid only returns a result on the app's next resume, so a
 * request Android refuses without a dialog ("denied twice") never settles. JS uses this to
 * spot that case before asking: false before the first ask and once blocked; true after one
 * denial.
 */
class PermissionsModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

  override fun getName() = NAME

  @ReactMethod
  fun shouldShowRationale(permission: String, promise: Promise) {
    promise.resolve(
        context.currentActivity?.shouldShowRequestPermissionRationale(permission) ?: false)
  }

  companion object {
    const val NAME = "PermissionsHelper"
  }
}
