package am.shtemarm.app

import org.junit.Assert.*
import org.junit.Test

class SessionGuardsTest {
    @Test fun acceptsOneCorrectChoice() {
        val answer = SessionGuards.evaluate(-1, 2, 2, 4)
        assertTrue(answer.accepted)
        assertTrue(answer.correct)
    }

    @Test fun incorrectChoiceIsStillAnswered() {
        val answer = SessionGuards.evaluate(-1, 1, 3, 4)
        assertTrue(answer.accepted)
        assertFalse(answer.correct)
    }

    @Test fun rejectsSecondTapOnSameQuestion() {
        val answer = SessionGuards.evaluate(0, 3, 3, 4)
        assertFalse(answer.accepted)
        assertFalse(answer.correct)
    }

    @Test fun rejectsInvalidChoiceOrBrokenAnswerIndex() {
        assertFalse(SessionGuards.evaluate(-1, 5, 1, 4).accepted)
        assertFalse(SessionGuards.evaluate(-1, 1, -1, 4).accepted)
        assertFalse(SessionGuards.evaluate(-1, 1, 1, 0).accepted)
    }

    @Test fun sessionCountsCannotBeInvalid() {
        assertTrue(SessionGuards.validSession(10, 7, "1e2c632b-4d19-4b0a-88b1-ad71dbecf607"))
        assertFalse(SessionGuards.validSession(0, 0, "1e2c632b-4d19-4b0a-88b1-ad71dbecf607"))
        assertFalse(SessionGuards.validSession(10, 11, "1e2c632b-4d19-4b0a-88b1-ad71dbecf607"))
        assertFalse(SessionGuards.validSession(5, 3, ""))
    }

    @Test fun onlyLoadsBooksReferencedBySavedQuestionIds() {
        assertEquals(setOf("book1.json", "history-book2.json"), SessionGuards.sourceAssets(
            setOf("book1.json:0:2:1", "book1.json:2:0:8", "history-book2.json:1:0:3",
                  "unknown", "../private.json:1:2:3")
        ))
    }
}
