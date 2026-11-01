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
    fun bundledEnglishBooksLoadAndKeepDistinctPlayableIds() = runBlocking {
        val appContext = ApplicationProvider.getApplicationContext<Context>()
        val repository = QuestionRepository(appContext)
        val files = listOf("book1.json", "book2.json", "book3.json")
        val loadedIds = mutableSetOf<String>()
        for (file in files) {
            val book = withTimeout(60_000L) {
                repository.load(StudyBook("Անգլերեն", "Ստուգում", file))
            }
            assertFalse("$file: no playable sections", book.sections.isEmpty())
            assertFalse("$file: no answerable source questions", book.allQuestions.isEmpty())
            assertTrue("$file: question IDs overlap other books",
                loadedIds.intersect(book.allQuestions.map { it.id }.toSet()).isEmpty())
            assertEquals("$file: duplicate playable IDs", book.allQuestions.size,
                book.allQuestions.map { it.id }.toSet().size)
            assertTrue("$file: invalid answer index",
                book.allQuestions.all { it.correctIndex in it.choices.indices })
            loadedIds.addAll(book.allQuestions.map { it.id })
        }

        // Switching back to a recently loaded book must retain its question IDs.
        val firstAgain = withTimeout(60_000L) {
            repository.load(StudyBook("Անգլերեն", "Ստուգում", files.first()))
        }
        assertTrue(firstAgain.allQuestions.isNotEmpty())
        assertTrue(firstAgain.allQuestions.all { it.id in loadedIds })
    }
}
