package com.smiledental.doctor.sms

import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Sends an SMS from the phone's own SIM. Resolves only once Android reports every
 * part as sent (not merely queued); rejects on a radio error or after 30 s.
 * Needs the SEND_SMS runtime permission, which JS requests first.
 */
class SmsModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

  override fun getName() = NAME

  @ReactMethod
  fun send(phone: String, message: String, promise: Promise) {
    val sms =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
            context.getSystemService(SmsManager::class.java)
        else @Suppress("DEPRECATION") SmsManager.getDefault()
    val parts = sms.divideMessage(message)
    val action = "$ACTION_PREFIX${System.nanoTime()}"
    val handler = Handler(Looper.getMainLooper())
    var pending = parts.size
    var settled = false

    lateinit var receiver: BroadcastReceiver
    fun settle(error: String?) {
      if (settled) return
      settled = true
      handler.removeCallbacksAndMessages(null)
      context.unregisterReceiver(receiver)
      if (error == null) promise.resolve(null) else promise.reject("SMS_FAILED", error)
    }

    receiver =
        object : BroadcastReceiver() {
          override fun onReceive(c: Context, intent: Intent) {
            if (resultCode != Activity.RESULT_OK) settle("Send failed (code $resultCode)")
            else if (--pending == 0) settle(null)
          }
        }
    ContextCompat.registerReceiver(
        context, receiver, IntentFilter(action), ContextCompat.RECEIVER_NOT_EXPORTED)
    handler.postDelayed({ settle("No confirmation from the network") }, TIMEOUT_MS)

    val sentIntents =
        ArrayList(
            parts.indices.map {
              PendingIntent.getBroadcast(
                  context,
                  it,
                  Intent(action).setPackage(context.packageName),
                  PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_ONE_SHOT)
            })
    try {
      sms.sendMultipartTextMessage(phone, null, parts, sentIntents, null)
    } catch (e: Exception) {
      settle(e.message ?: "Send failed")
    }
  }

  companion object {
    const val NAME = "SmsSender"
    private const val ACTION_PREFIX = "com.smiledental.doctor.SMS_SENT."
    private const val TIMEOUT_MS = 30_000L
  }
}
