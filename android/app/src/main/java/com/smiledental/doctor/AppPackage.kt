package com.smiledental.doctor

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.smiledental.doctor.permissions.PermissionsModule
import com.smiledental.doctor.sms.SmsModule

// The app's own native modules: plain (non-Turbo), loaded through the new
// architecture's interop layer.
class AppPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
      when (name) {
        SmsModule.NAME -> SmsModule(reactContext)
        PermissionsModule.NAME -> PermissionsModule(reactContext)
        else -> null
      }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    listOf(SmsModule::class.java to SmsModule.NAME, PermissionsModule::class.java to PermissionsModule.NAME)
        .associate { (cls, name) ->
          name to
              ReactModuleInfo(
                  name,
                  cls.name,
                  canOverrideExistingModule = false,
                  needsEagerInit = false,
                  isCxxModule = false,
                  isTurboModule = false)
        }
  }
}
