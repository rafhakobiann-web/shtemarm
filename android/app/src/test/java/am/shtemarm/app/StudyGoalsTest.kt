package am.shtemarm.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class StudyGoalsTest {
    @Test fun validDailyTargets() {
        assertTrue(StudyGoals.validTarget(10))
        assertTrue(StudyGoals.validTarget(30))
        assertFalse(StudyGoals.validTarget(0))
        assertFalse(StudyGoals.validTarget(10000))
    }

    @Test fun progressNeverOverflows() {
        assertEquals(0f, StudyGoals.completion(10, 0), 0.001f)
        assertEquals(0.5f, StudyGoals.completion(10, 5), 0.001f)
        assertEquals(1f, StudyGoals.completion(10, 20), 0.001f)
        assertEquals(0, StudyGoals.remaining(10, 20))
        assertEquals(7, StudyGoals.remaining(10, 3))
    }
}
