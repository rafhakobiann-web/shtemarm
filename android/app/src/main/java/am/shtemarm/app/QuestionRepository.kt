package am.shtemarm.app

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.ensureActive
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
    val allQuestions: List<StudyQuestion> = sections.flatMap { it.questions }
}

object BookCatalog {
    val books = listOf(
        StudyBook("Մաթեմատիկա", "Մաս 1 · թվայնացված հարցեր", "math-text-questions-extra.json"),
        StudyBook("Մաթեմատիկա", "Մաս 2 · թվայնացված հարցեր", "math-text-questions-extra.json"),
        StudyBook("Մաթեմատիկա", "Հեղինակային վարժություններ · 0.3.0", "original-math.json"),
        StudyBook("Անգլերեն", "Շտեմարան 1", "book1.json"),
        StudyBook("Անգլերեն", "Շտեմարան 2", "book2.json"),
        StudyBook("Անգլերեն", "Շտեմարան 3", "book3.json"),
        StudyBook("Անգլերեն", "Հեղինակային վարժություններ · 0.3.0", "original-english.json"),
        StudyBook("Հայոց լեզու", "Շտեմարան 1", "armenian-book1.json"),
        StudyBook("Հայոց պատմություն", "Շտեմարան 1", "history-book1.json"),
        StudyBook("Հայոց պատմություն", "Շտեմարան 2", "history-book2.json"),
        StudyBook("Հայոց պատմություն", "Շտեմարան 3", "history-book3.json"),
        StudyBook("Հայոց պատմություն", "2026 թեստերի հարցեր", "history-tests.json"),
        StudyBook("Հայոց պատմություն", "Ստուգված հարցաշար · Մաս 1", "history-bank-book1.json"),
        StudyBook("Հայոց պատմություն", "Հեղինակային վարժություններ · 0.3.0", "original-history.json"),
        StudyBook("Կենսաբանություն", "Շտեմարան 1", "bio-book1.json"),
        StudyBook("Կենսաբանություն", "Շտեմարան 2", "bio-book2.json"),
        StudyBook("Կենսաբանություն", "Մաս 3 · 36 հեղինակային վարժություն", "bio-book3.json"),
        StudyBook("Կենսաբանություն", "Մաս 3 · լրացուցիչ հեղինակային", "original-biology-3.json"),
        StudyBook("Ֆիզիկա", "Շտեմարան 1", "physics-book1.json"),
        StudyBook("Ֆիզիկա", "Շտեմարան 2", "physics-book2.json"),
        StudyBook("Ֆիզիկա", "Բնօրինակ · Մաս 1", "physics-original-book1.json"),
        StudyBook("Ֆիզիկա", "Բնօրինակ · Մաս 2", "physics-original-book2.json"),
        StudyBook("Ֆիզիկա", "Սկզբնաղբյուրից ստուգված հարցեր", "physics-original-transcribed.json"),
        StudyBook("Ֆիզիկա", "Լրացուցիչ վարժություններ", "original-physics.json"),
        StudyBook("Քիմիա", "Հարցերի հավաքածու", "original-chemistry.json"),
        StudyBook("Աշխարհագրություն", "Հարցերի հավաքածու", "original-geography.json"),
        StudyBook("Ռուսերեն", "Հարցերի հավաքածու", "original-russian.json")
    )
    val subjects = books.map { it.subject }.distinct()
}

/** Skips unanswered, illustrated, and non-MCQ material instead of inventing answers. */
class QuestionRepository(private val context: Context) {
    // Keep a small LRU of parsed books. Switching among subjects must not parse
    // multi-megabyte JSON on every navigation; do not keep the whole library in RAM.
    private val recentBooks = object : LinkedHashMap<String, LoadedBook>(6, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, LoadedBook>?): Boolean =
            size > 4
    }

    suspend fun load(book: StudyBook): LoadedBook = withContext(Dispatchers.IO) {
        synchronized(recentBooks) { recentBooks[book.asset] }?.let { return@withContext it }
        ensureActive()
        val json = context.assets.open(book.asset).bufferedReader(Charsets.UTF_8)
            .use { JSONObject(it.readText()) }
        val result = mutableListOf<StudySection>()
        val sections = json.optJSONArray("sections")
        if (sections != null) {
            for (si in 0 until sections.length()) {
                ensureActive()
                val section = sections.optJSONObject(si) ?: continue
                val title = BookStudyHelpers.sectionTitle(
                    book.subject, section.optString("title"), section.optString("label"),
                    section.optString("instr_hy"), si
                )
                val questions = mutableListOf<StudyQuestion>()
                val units = section.optJSONArray("units") ?: continue
                for (ui in 0 until units.length()) {
                    ensureActive()
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
                    ensureActive()
                    val test = tests.optJSONObject(ti) ?: continue
                    val tasks = test.optJSONArray("tasks") ?: continue
                    val questions = mutableListOf<StudyQuestion>()
                    for (ui in 0 until tasks.length()) {
                        ensureActive()
                        val unit = tasks.optJSONObject(ui) ?: continue
                        parseUnit(book.asset, ti, ui, unit, questions)
                    }
                    if (questions.isNotEmpty())
                        result.add(StudySection("Թեստ " + test.optInt("id", ti + 1), questions))
                }
            } else {
                // Existing source-reviewed history and physics banks are flat
                // question arrays, not sections/units. Preserve their real
                // chapter names and score only keyed, non-illustrated choices.
                val flat = json.optJSONArray("questions") ?: json.optJSONArray("items")
                if (flat != null) {
                    val verifiedRoot = json.has("verified")
                    val grouped = linkedMapOf<String, MutableList<StudyQuestion>>()
                    for (i in 0 until flat.length()) {
                        ensureActive()
                        val question = flat.optJSONObject(i) ?: continue
                        if (!verifiedRoot &&
                            question.optString("status") != "source-reviewed") continue
                        val parsed = parseFlatQuestion(book.asset, i, question) ?: continue
                        val section = question.optString("section").trim()
                            .ifBlank { "Ընդհանուր հարցեր" }
                        grouped.getOrPut(section) { mutableListOf() }.add(parsed)
                    }
                    for ((title, questions) in grouped) {
                        if (questions.isNotEmpty()) result.add(StudySection(title, questions))
                    }
                }
            }
        }
        val parsed = LoadedBook(result)
        synchronized(recentBooks) { recentBooks[book.asset] = parsed }
        parsed
    }

    /** Unified verified question source for exams, games, and study generators.
     * load() already dispatches its own asset reads and JSON parsing to IO.
     * Avoid wrapping the entire non-math aggregation in a second IO dispatch.
     */
    suspend fun sectionsForSubject(subject: String): List<StudySection> {
        val sections = mutableListOf<StudySection>()
        if (subject == "Մաթեմատիկա") {
            // The dedicated scored-math reader is synchronous, so it must
            // remain on IO. Other subjects rely on load()'s own dispatcher.
            withContext(Dispatchers.IO) {
                for (part in 1..2) {
                    ensureActive()
                    try {
                        sections += loadScoredMath(context, part).sections.map {
                            it.copy(title = "Մաս $part · " + it.title)
                        }
                    } catch (e: CancellationException) {
                        throw e
                    } catch (_: Exception) { /* Other verified parts remain available. */ }
                }
            }
            // This original practice bank is separate from the scored source PDFs.
            // load() dispatches to IO itself; do not add nested IO dispatch.
            for (practice in BookCatalog.books.filter {
                it.subject == subject && it.asset == "original-math.json"
            }) {
                ensureActive()
                try {
                    sections += load(practice).sections.map {
                        it.copy(title = practice.title + " · " + it.title)
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) { /* Keep the existing math books available. */ }
            }
        } else {
            for (book in BookCatalog.books.filter { it.subject == subject }.distinctBy { it.asset }) {
                try {
                    sections += load(book).sections.map {
                        it.copy(title = book.title + " · " + it.title)
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) { /* Do not hide other accessible books. */ }
            }
        }
        return sections
    }

    suspend fun practiceForSubject(subject: String): List<StudyQuestion> {
        val sections = sectionsForSubject(subject)
        // De-duplication is CPU work; avoid scheduling another IO dispatch.
        return withContext(Dispatchers.Default) {
            BookStudyHelpers.uniquePracticeQuestions(sections.flatMap { it.questions })
        }
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
            val originalStem = q.optString("stem").trim()
            // In the English gap-fill sections the question is the numbered blank
            // inside the passage; its individual stem is intentionally empty.
            // Recover only those demonstrable numbered gaps, never missing
            // reading-comprehension questions or unknown answers.
            val number = q.optString("n").trim()
            val marker = "($number)"
            val markerIndex = if (number.isNotBlank()) passage.indexOf(marker) else -1
            val afterMarker = if (markerIndex >= 0) passage.substring(
                markerIndex + marker.length,
                minOf(markerIndex + marker.length + 30, passage.length)
            ) else ""
            val isGap = markerIndex >= 0 && afterMarker.contains(Regex("_{2,}"))
            val stem = if (originalStem.isNotBlank()) originalStem
                else if (isGap) "Ընտրիր ճիշտ տարբերակը՝ $marker բացթողման համար։"
                else continue
            if (stem.contains("<img", ignoreCase = true) ||
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

    private fun parseFlatQuestion(
        source: String, index: Int, q: JSONObject
    ): StudyQuestion? {
        if (hasVisual(q)) return null
        val stem = q.optString("stem").trim()
        if (stem.isBlank() || stem.contains("<img", ignoreCase = true) ||
            stem.contains("\\includegraphics", ignoreCase = true)) return null
        val options = q.optJSONObject("options") ?: return null
        val keys = when {
            options.has("1") -> listOf("1", "2", "3", "4")
            options.has("a") -> listOf("a", "b", "c", "d")
            else -> return null
        }.takeWhile { options.optString(it).isNotBlank() }
        if (keys.size !in 2..4) return null
        val choices = keys.map { options.optString(it).trim() }
        if (choices.any { it.isBlank() } || choices.distinct().size != choices.size) return null
        val answer = keys.indexOf(q.optString("answer").trim().lowercase())
        if (answer !in choices.indices) return null
        return StudyQuestion(
            id = source + ":flat:" + index,
            stem = stem,
            choices = choices,
            correctIndex = answer,
            explanation = q.optString("explanation").trim()
        )
    }

    private fun hasVisual(q: JSONObject): Boolean =
        listOf("image", "diagram", "figure", "imageUrl").any {
            q.has(it) && !q.isNull(it) && q.optString(it).isNotBlank()
        }
}
