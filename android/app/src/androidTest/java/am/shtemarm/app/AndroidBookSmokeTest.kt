package am.shtemarm.app

import android.content.Context
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Android emulator smoke tests. A CI emulator is NOT a physical-device test and
 * cannot verify touch latency, display typography or installed APK signing.
 */
@RunWith(AndroidJUnit4::class)
class AndroidBookSmokeTest {
    @Test
    fun launchesNativeAppWithoutAnActivityCrash() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals("am.shtemarm.app", activity.packageName)
                assertNotNull(activity.window.decorView)
            }
        }
    }

    @Test
    fun everyCoreTextbookVolumeLoadsAsAnAnswerableOfflineBook() = runBlocking {
        val appContext = ApplicationProvider.getApplicationContext<Context>()
        val repository = QuestionRepository(appContext)
        val coreBooks = BookCatalog.books.filter { it.title.startsWith("Շտեմարան ") }
        val expectedAssets = setOf(
            "book1.json", "book2.json", "book3.json",
            "armenian-book1.json", "armenian-book2.json", "armenian-book3.json", "armenian-book4.json",
            "history-book1.json", "history-book2.json", "history-book3.json",
            "bio-book1.json", "bio-book2.json", "bio-book3.json", "bio-book4.json",
            "physics-book1.json", "physics-book2.json"
        )
        assertEquals("Core book catalog size", expectedAssets.size, coreBooks.size)
        assertEquals("Core book catalog assets", expectedAssets, coreBooks.map { it.asset }.toSet())

        val loadedIds = mutableSetOf<String>()
        for (bookInfo in coreBooks) {
            val book = withTimeout(120_000L) { repository.load(bookInfo) }
            assertFalse("${bookInfo.asset}: no playable sections", book.sections.isEmpty())
            assertFalse("${bookInfo.asset}: no answerable source questions", book.allQuestions.isEmpty())
            assertTrue("${bookInfo.asset}: question IDs overlap other books",
                loadedIds.intersect(book.allQuestions.map { it.id }.toSet()).isEmpty())
            assertEquals("${bookInfo.asset}: duplicate playable IDs", book.allQuestions.size,
                book.allQuestions.map { it.id }.toSet().size)
            assertTrue("${bookInfo.asset}: invalid answer index",
                book.allQuestions.all { it.correctIndex in it.choices.indices })
            loadedIds.addAll(book.allQuestions.map { it.id })
        }

        val recentlyLoaded = withTimeout(60_000L) { repository.load(coreBooks.first()) }
        assertTrue(recentlyLoaded.allQuestions.isNotEmpty())
        assertTrue(recentlyLoaded.allQuestions.all { it.id in loadedIds })
    }

    @Test
    fun bothMathPartsLoadPlayableOfflineQuestions() = runBlocking {
        val appContext = ApplicationProvider.getApplicationContext<Context>()
        val loadedIds = mutableSetOf<String>()
        for (part in 1..2) {
            val book = withTimeout(120_000L) { loadScoredMath(appContext, part) }
            assertFalse("Math part $part: no playable sections", book.sections.isEmpty())
            assertFalse("Math part $part: no verified questions", book.allQuestions.isEmpty())
            assertTrue("Math part $part: invalid answer index",
                book.allQuestions.all { it.correctIndex in it.choices.indices })
            val ids = book.allQuestions.map { it.id }.toSet()
            assertEquals("Math part $part: duplicate question IDs", book.allQuestions.size, ids.size)
            assertTrue("Math parts share question IDs", loadedIds.intersect(ids).isEmpty())
            loadedIds.addAll(ids)
        }
    }
}
