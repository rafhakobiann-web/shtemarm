package am.shtemarm.app

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.Worker
import androidx.work.WorkerParameters
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/**
 * Local, opt-in study reminders. No FCM, analytics, remote user tracking or
 * exact alarms. WorkManager may defer checks under Android battery limits.
 */
object StudyReminders {
    private const val PREFS = "shtemarm_reminders_v1"
    private const val WORK = "shtemarm_optional_study_reminders"
    private const val CHANNEL = "shtemarm_study_reminders"
    private const val THREE_DAYS = 3L * 24 * 60 * 60 * 1000
    private const val SEVEN_DAYS = 7L * 24 * 60 * 60 * 1000

    fun enabled(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean("enabled", false)

    fun markOpened(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putLong("last_opened", System.currentTimeMillis()).apply()
    }

    fun setEnabled(context: Context, enabled: Boolean) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean("enabled", enabled)
            .putLong("last_opened", System.currentTimeMillis()).apply()
        if (enabled) {
            createChannel(context)
            val request = PeriodicWorkRequestBuilder<StudyReminderWorker>(24, TimeUnit.HOURS)
                .setInitialDelay(24, TimeUnit.HOURS)
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK, ExistingPeriodicWorkPolicy.KEEP, request
            )
        } else {
            WorkManager.getInstance(context).cancelUniqueWork(WORK)
            NotificationManagerCompat.from(context).cancel(1001)
        }
    }

    private fun createChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= 26) {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(NotificationChannel(
                CHANNEL, "Ուսման հիշեցումներ", NotificationManager.IMPORTANCE_DEFAULT
            ).apply { description = "Կամավոր հիշեցումներ՝ ուսումը շարունակելու համար" })
        }
    }

    internal fun notifyIfDue(context: Context, now: Long = System.currentTimeMillis()) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (!prefs.getBoolean("enabled", false)) return
        val lastOpened = prefs.getLong("last_opened", now)
        val lastSent = prefs.getLong("last_sent", 0L)
        if (now - lastOpened < THREE_DAYS || now - lastSent < SEVEN_DAYS) return
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return

        createChannel(context)
        val days = ((now - lastOpened) / (24 * 60 * 60 * 1000)).coerceAtLeast(3)
        val lang = StudyProgress(context).studyLanguage
        val title = when (lang) {
            "en" -> "Shtemarm is ready when you are"
            "ru" -> "Shtemarm ждёт тебя"
            else -> "Shtemarm-ը քեզ է սպասում"
        }
        val message = when (lang) {
            "en" -> "It's been $days days. A short study session is here whenever you're ready."
            "ru" -> "Прошло $days дн. Возвращайся к занятиям, когда будет удобно."
            else -> "Արդեն $days օր է անցել։ Երբ հարմար լինի, կարող ես շարունակել սովորել։"
        }
        val launch = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pending = PendingIntent.getActivity(context, 0, launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(context, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setContentIntent(pending)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()
        try {
            NotificationManagerCompat.from(context).notify(1001, notification)
            prefs.edit().putLong("last_sent", now).apply()
        } catch (_: SecurityException) {
            // Permission may have been revoked between the check and notification.
        }
    }
}

class StudyReminderWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        StudyReminders.notifyIfDue(applicationContext)
        return Result.success()
    }
}
