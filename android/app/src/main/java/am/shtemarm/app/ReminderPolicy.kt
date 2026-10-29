package am.shtemarm.app

/** A gentle inactivity reminder: never before day 3 and never more than weekly. */
internal object ReminderPolicy {
    private const val DAY = 24L * 60 * 60 * 1000
    fun isDue(now: Long, lastOpened: Long, lastSent: Long): Boolean =
        now >= lastOpened && now - lastOpened >= 3 * DAY &&
            now >= lastSent && now - lastSent >= 7 * DAY
}
