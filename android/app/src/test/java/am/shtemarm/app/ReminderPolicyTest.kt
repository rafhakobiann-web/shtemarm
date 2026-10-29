package am.shtemarm.app

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ReminderPolicyTest {
    private val day = 24L * 60 * 60 * 1000

    @Test fun noReminderBeforeThreeDays() {
        assertFalse(ReminderPolicy.isDue(2 * day, 0L, 0L))
        assertTrue(ReminderPolicy.isDue(3 * day, 0L, 0L))
    }

    @Test fun neverMoreThanOnceAWeek() {
        assertFalse(ReminderPolicy.isDue(10 * day, 0L, 5 * day))
        assertTrue(ReminderPolicy.isDue(12 * day, 0L, 5 * day))
    }

    @Test fun recentActivitySuppressesReminder() {
        assertFalse(ReminderPolicy.isDue(15 * day, 14 * day, 0L))
    }

    @Test fun quietHoursProtectRestTime() {
        for (hour in 0..8) assertTrue(ReminderPolicy.withinQuietHours(hour))
        for (hour in 9..20) assertFalse(ReminderPolicy.withinQuietHours(hour))
        for (hour in 21..23) assertTrue(ReminderPolicy.withinQuietHours(hour))
    }

    @Test fun invalidFutureTimestampsDoNotTrigger() {
        assertFalse(ReminderPolicy.isDue(10 * day, 11 * day, 0L))
        assertFalse(ReminderPolicy.isDue(10 * day, 0L, 11 * day))
    }
}
