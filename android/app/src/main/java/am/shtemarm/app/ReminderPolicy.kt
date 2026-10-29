package am.shtemarm.app

/** A gentle inactivity reminder: never before day 3 and never more than weekly. */
internal object ReminderPolicy {
    private const val DAY = 24L * 60 * 60 * 1000
    /** Never interrupt sleep or early mornings; the next periodic check can retry. */
    fun withinQuietHours(hourOfDay: Int): Boolean = hourOfDay !in 9..20

    fun isDue(now: Long, lastOpened: Long, lastSent: Long): Boolean =
        now >= lastOpened && now - lastOpened >= 3 * DAY &&
            (lastSent == 0L || (now >= lastSent && now - lastSent >= 7 * DAY))
}
