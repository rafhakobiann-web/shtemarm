package am.shtemarm.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ReaderTypographyTest {
    @Test fun defaultAndBoundsStayReadable() {
        assertEquals(16, ReaderTypography.DEFAULT_TEXT_SIZE_SP)
        assertEquals(ReaderTypography.MIN_TEXT_SIZE_SP, ReaderTypography.normalize(Int.MIN_VALUE))
        assertEquals(ReaderTypography.MAX_TEXT_SIZE_SP, ReaderTypography.normalize(Int.MAX_VALUE))
    }

    @Test fun controlsAdjustByOneAndStopAtBounds() {
        assertEquals(15, ReaderTypography.decrease(16))
        assertEquals(ReaderTypography.MIN_TEXT_SIZE_SP, ReaderTypography.decrease(ReaderTypography.MIN_TEXT_SIZE_SP))
        assertEquals(17, ReaderTypography.increase(16))
        assertEquals(ReaderTypography.MAX_TEXT_SIZE_SP, ReaderTypography.increase(ReaderTypography.MAX_TEXT_SIZE_SP))
    }
}
