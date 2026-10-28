package am.shtemarm.app

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

/** Bundled data comes from the website repository's public/data directory at build time. */
data class StudyBook(val subject: String, val title: String, val asset: String)
data class StudyQuestion(
    val id: String,
    val stem: String,
    val choices: List<String>,
    val correctIndex: Int,
    val passage: String = "",
    val explanation: String = ""
)
data class StudySection(val title: String, val questions: List<StudyQuestion>)
data class LoadedBook(val sections: List<StudySection>) {
    val allQuestions: List<StudyQuestion> get() = sections.flatMap { it.questions }
}

object BookCatalog {
    val books = listOf(
        StudyBook("Մաթեմատիկա", "Մաս 1 · թվայնացված հարցեր", "math-text-questions-extra.json"),
        StudyBook("Մաթեմատիկա", "Մաս 2 · թվայնացված հարցեր", "math-text-questions-extra.json"),
        StudyBook("Անգլերեն", "Շտեմարան 1", "book1.json"),
        StudyBook("Անգլերեն", "Շտեմարան 2", "book2.json"),
        StudyBook("Անգլերեն", "Շտեմարան 3", "book3.json"),
        StudyBook("Հայոց լեզու", "Շտեմարան 1", "armenian-book1.json"),
        StudyBook("Հայոց պատմություն", "Շտեմարան 1", "history-book1.json"),
        StudyBook("Հայոց պատմություն", "Շտեմարան 2", "history-book2.json"),
        StudyBook("Հայոց պատմություն", "Շտեմարան 3", "history-book3.json"),
        StudyBook("Հայոց պատմություն", "2026 թեստերի հարցեր", "history-tests.json"),
        StudyBook("Կենսաբանություն", "Շտեմարան 1", "bio-book1.json"),
        StudyBook("Կենսաբանություն", "Շտեմարան 2", "bio-book2.json"),
        StudyBook("Ֆիզիկա", "Շտեմարան 1", "physics-book1.json"),
        StudyBook("Ֆիզիկա", "Շտեմարան 2", "physics-book2.json"),
        StudyBook("Ֆիզիկա", "Բնօրինակ · Մաս 1", "physics-original-book1.json"),
        StudyBook("Ֆիզիկա", "Բնօրինակ · Մաս 2", "physics-original-book2.json"),
        StudyBook("Քիմիա", "Հարցերի հավաքածու", "original-chemistry.json"),
        StudyBook("Աշխարհագրություն", "Հարցերի հավաքածու", "original-geography.json"),
        StudyBook("Ռուսերեն", "Հարցերի հավաքածու", "original-russian.json")
    )
    val subjects = books.map { it.subject }.distinct()
}

/** Skips unanswered, illustrated, and non-MCQ material instead of inventing answers. */
class QuestionRepository(private val context: Context) {
    suspend fun load(book: StudyBook): LoadedBook = withContext(Dispatchers.IO) {
        val json = context.assets.open(book.asset).bufferedReader(Charsets.UTF_8)
            .use { JSONObject(it.readText()) }
        val result = mutableListOf<StudySection>()
        val sections = json.optJSONArray("sections")
        if (sections != null) {
            for (si in 0 until sections.length()) {
                val section = sections.optJSONObject(si) ?: continue
                val title = section.optString("title").ifBlank {
                    section.optString("label").ifBlank { "Բաժին " + (si + 1) }
                }
                val questions = mutableListOf<StudyQuestion>()
                val units = section.optJSONArray("units") ?: continue
                for (ui in 0 until units.length()) {
                    val unit = units.optJSONObject(ui) ?: continue
                    parseUnit(book.asset, si, ui, unit, questions)
                }
                if (questions.isNotEmpty()) result.add(StudySection(title, questions))
            }
        } else {
            // Some digitized Armenian History examinations use tests/tasks instead of sections/units.
            val tests = json.optJSONArray("tests")
            if (tests != null) {
                for (ti in 0 until tests.length()) {
                    val test = tests.optJSONObject(ti) ?: continue
                    val tasks = test.optJSONArray("tasks") ?: continue
                    val questions = mutableListOf<StudyQuestion>()
                    for (ui in 0 until tasks.length()) {
                        val unit = tasks.optJSONObject(ui) ?: continue
                        parseUnit(book.asset, ti, ui, unit, questions)
                    }
                    if (questions.isNotEmpty())
                        result.add(StudySection("Թեստ " + test.optInt("id", ti + 1), questions))
                }
            }
        }
        LoadedBook(result)
    }

    private fun parseUnit(
        source: String, section: Int, unitIndex: Int,
        unit: JSONObject, output: MutableList<StudyQuestion>
    ) {
        if (unit.optString("kind") != "mc" || hasVisual(unit)) return
        val passage = unit.optString("passage").trim()
        val questions = unit.optJSONArray("questions") ?: return
        for (qi in 0 until questions.length()) {
            val q = questions.optJSONObject(qi) ?: continue
            if (hasVisual(q)) continue
            val stem = q.optString("stem").trim()
            if (stem.isBlank() || stem.contains("<img", ignoreCase = true) ||
                stem.contains("\\includegraphics", ignoreCase = true)) continue
            val options = q.optJSONObject("options") ?: continue
            val keys = when {
                options.has("a") -> listOf("a", "b", "c", "d")
                options.has("1") -> listOf("1", "2", "3", "4")
                else -> continue
            }
            // Supports both four-choice and two-choice true/false exercises.
            val availableKeys = keys.takeWhile { options.optString(it).isNotBlank() }
            if (availableKeys.size !in 2..4) continue
            val choices = availableKeys.map { options.optString(it).trim() }
            if (choices.any { it.isBlank() } || choices.distinct().size != choices.size) continue
            val answerIndex = availableKeys.indexOf(q.optString("answer").trim().lowercase())
            if (answerIndex < 0) continue
            output.add(
                StudyQuestion(
                    source + ":" + section + ":" + unitIndex + ":" + qi,
                    stem, choices, answerIndex,
                    passage, q.optString("explanation").trim()
                )
            )
        }
    }

    private fun hasVisual(q: JSONObject): Boolean =
        listOf("image", "diagram", "figure", "imageUrl").any {
            q.has(it) && !q.isNull(it) && q.optString(it).isNotBlank()
        }
}
