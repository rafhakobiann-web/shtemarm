package am.shtemarm.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AdaptiveRevisionTest {
    @Test fun prioritizesWeakChaptersBeforeStrongOnes() {
        val result = AdaptiveRevision.plan(listOf(
            RevisionChapter("strong#1", 20, 19, 3),
            RevisionChapter("weak#2", 20, 5, 2),
            RevisionChapter("medium#3", 20, 15, 2)
        ))
        assertEquals(listOf("weak#2", "medium#3", "strong#1"), result.map { it.chapterKey })
    }

    @Test fun doesNotRecommendInvalidOrDuplicateRecords() {
        val result = AdaptiveRevision.plan(listOf(
            RevisionChapter("a#1", -1, 0, 0),
            RevisionChapter("b#1", 2, 3, 1),
            RevisionChapter("c#1", 5, 2, 1),
            RevisionChapter("c#1", 5, 2, 1),
            RevisionChapter("", 0, 0, 0)
        ))
        assertEquals(listOf("c#1"), result.map { it.chapterKey })
    }

    @Test fun zeroLimitAndEmptyHistoryAreSafe() {
        assertTrue(AdaptiveRevision.plan(emptyList()).isEmpty())
        assertTrue(AdaptiveRevision.plan(listOf(RevisionChapter("a#1", 0, 0, 0)), 0).isEmpty())
        assertEquals("not-started", AdaptiveRevision.plan(listOf(RevisionChapter("a#1", 0, 0, 0))).single().reason)
    }
}
