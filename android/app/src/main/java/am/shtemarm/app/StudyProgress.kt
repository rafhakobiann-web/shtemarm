package am.shtemarm.app

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class SubjectStats(val answered: Int, val correct: Int, val sessions: Int) {
    val accuracy: Int get() = if (answered == 0) 0 else (correct * 100 / answered)
}

class StudyProgress(context: Context) {
    private val prefs = context.getSharedPreferences("shtemarm_native_v1", Context.MODE_PRIVATE)

    var studyLanguage: String
        get() = prefs.getString("study_language", "hy")?.takeIf { it in setOf("hy","en","ru") } ?: "hy"
        set(value) { if (value in setOf("hy","en","ru")) prefs.edit().putString("study_language",value).apply() }

    var dailyQuestionTarget: Int
        get() = prefs.getInt("daily_question_target", 10).takeIf(StudyGoals::validTarget) ?: 10
        set(value) {
            if (StudyGoals.validTarget(value)) prefs.edit().putInt("daily_question_target", value).apply()
        }

    val onboardingComplete: Boolean
        get() = prefs.getBoolean("student_setup_complete", false)

    val studentGrade: String
        get() = prefs.getString("student_grade", "") ?: ""

    val focusSubjects: Set<String>
        get() = prefs.getStringSet("focus_subjects", BookCatalog.subjects.toSet())
            .orEmpty().filter { it in BookCatalog.subjects }.toSet()

    val discoverySource: String
        get() = prefs.getString("discovery_source", "") ?: ""

    val offlineBookAssets: Set<String>
        get() = prefs.getStringSet("offline_book_assets", emptySet())
            .orEmpty().filter { asset -> BookCatalog.books.any { it.asset == asset } }.toSet()

    /** Store student preferences locally; no account or remote tracking is used. */
    fun saveStudentSetup(
        language: String,
        grade: String,
        subjects: Set<String>,
        source: String,
        offlineBooks: Set<String>,
        dailyTarget: Int
    ) {
        val safeLanguage = language.takeIf { it in setOf("hy", "en", "ru") } ?: "hy"
        val safeGrade = grade.takeIf { it in setOf("9", "10", "11", "12", "other") } ?: "other"
        val safeSubjects = subjects.filter { it in BookCatalog.subjects }.toSet()
            .ifEmpty { BookCatalog.subjects.toSet() }
        val safeSource = source.takeIf {
            it in setOf("tiktok", "instagram", "youtube", "friend", "teacher", "search", "school", "other", "skip")
        } ?: "skip"
        val validAssets = BookCatalog.books.map { it.asset }.toSet()
        val safeOffline = offlineBooks.filter { it in validAssets }.toSet()
        prefs.edit()
            .putBoolean("student_setup_complete", true)
            .putString("study_language", safeLanguage)
            .putString("student_grade", safeGrade)
            .putStringSet("focus_subjects", safeSubjects)
            .putString("discovery_source", safeSource)
            .putStringSet("offline_book_assets", safeOffline)
            .putInt("daily_question_target", dailyTarget.takeIf(StudyGoals::validTarget) ?: 10)
            .apply()
    }

    fun answeredToday(today: String = SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).format(Date())): Int =
        if (prefs.getString("daily_answered_date", "") == today)
            prefs.getInt("daily_answered_count", 0).coerceAtLeast(0) else 0

    fun stats(subject: String): SubjectStats {
        val prefix = "s_" + subject + "_"
        return SubjectStats(
            prefs.getInt(prefix + "answered", 0),
            prefs.getInt(prefix + "correct", 0),
            prefs.getInt(prefix + "sessions", 0)
        )
    }

    /**
     * Transactionally record a finished session at most once. A double-tap
     * or a repeated result callback cannot inflate scores and XP.
     */
    fun saveSessionOnce(
        subject: String, correct: Int, answered: Int,
        sessionId: String, chapterKey: String? = null
    ): Boolean {
        if (!SessionGuards.validSession(answered, correct, sessionId)) return false
        synchronized(this) {
            if (prefs.getString("last_completed_session", null) == sessionId) return false
            val prefix = "s_" + subject + "_"
            val current = stats(subject)
            // commit() is deliberate: scores and the de-duplication token
            // must reach disk in the same transaction before success.
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).format(Date())
            val newDaily = (answeredToday(today) + answered).coerceAtMost(100000)
            val editor = prefs.edit()
                .putString("daily_answered_date", today)
                .putInt("daily_answered_count", newDaily)
                .putInt(prefix + "answered", current.answered + answered)
                .putInt(prefix + "correct", current.correct + correct)
                .putInt(prefix + "sessions", current.sessions + 1)
                .putString("last_completed_session", sessionId)
            if (chapterKey != null && validChapterKey(chapterKey)) {
                val currentChapter = chapterStats(chapterKey)
                val chapterPrefix = "ch_" + chapterKey + "_"
                editor.putInt(chapterPrefix + "answered", currentChapter.answered + answered)
                    .putInt(chapterPrefix + "correct", currentChapter.correct + correct)
                    .putInt(chapterPrefix + "sessions", currentChapter.sessions + 1)
            }
            return editor.commit()
        }
    }

    private fun validChapterKey(key: String): Boolean {
        if (key.length !in 7..160 || key.count { it == '#' } != 1) return false
        val asset = key.substringBefore('#')
        val section = key.substringAfter('#').toIntOrNull() ?: return false
        return section in 0..500 && BookCatalog.books.any { it.asset == asset }
    }

    fun chapterStats(chapterKey: String): SubjectStats {
        if (!validChapterKey(chapterKey)) return SubjectStats(0, 0, 0)
        val prefix = "ch_" + chapterKey + "_"
        return SubjectStats(
            prefs.getInt(prefix + "answered", 0),
            prefs.getInt(prefix + "correct", 0),
            prefs.getInt(prefix + "sessions", 0)
        )
    }

    /** Return to the last opened source without storing any textbook text. */
    fun recordLastBook(book: StudyBook) {
        prefs.edit().putString("last_book_asset", book.asset)
            .putString("last_book_title", book.title).apply()
    }

    fun lastBook(): StudyBook? {
        val asset = prefs.getString("last_book_asset", null) ?: return null
        val title = prefs.getString("last_book_title", null) ?: return null
        return BookCatalog.books.firstOrNull { it.asset == asset && it.title == title }
    }

    fun mistakeIds(): Set<String> =
        prefs.getStringSet("mistakes", emptySet()).orEmpty().toSet()

    /** Keep only recent, answer-key-verified missed questions. */
    fun recordMistakes(questions: List<StudyQuestion>, correctIds: Set<String>) {
        val mistakes = LinkedHashSet(mistakeIds())
        for (question in questions) {
            if (question.id in correctIds) mistakes.remove(question.id)
            else mistakes.add(question.id)
        }
        while (mistakes.size > 2000) mistakes.remove(mistakes.first())
        prefs.edit().putStringSet("mistakes", mistakes).apply()
    }

    fun removeMistake(id: String) {
        val missed = mistakeIds().toMutableSet()
        missed.remove(id)
        prefs.edit().putStringSet("mistakes", missed).apply()
    }

    /**
     * User-controlled, local-only backup. No API keys or account tokens are
     * included. Do not silently upload these files to a remote service.
     */
    fun exportSnapshot(): String {
        val statsJson = JSONObject()
        for (subject in BookCatalog.subjects + "Կրկնություն") {
            val stats = stats(subject)
            statsJson.put(subject, JSONObject()
                .put("answered", stats.answered)
                .put("correct", stats.correct)
                .put("sessions", stats.sessions))
        }
        val bookmarks = JSONArray()
        for (id in bookmarkedIds().sorted()) bookmarks.put(id)
        val mistakes = JSONArray()
        for (id in mistakeIds().sorted()) mistakes.put(id)
        val lastBook = lastBook()
        val chapters = JSONObject()
        val keys = prefs.all.keys.filter { it.startsWith("ch_") && it.endsWith("_sessions") }
        for (key in keys) {
            val id = key.removePrefix("ch_").removeSuffix("_sessions")
            if (!validChapterKey(id)) continue
            val stats = chapterStats(id)
            chapters.put(id, JSONObject()
                .put("answered", stats.answered).put("correct", stats.correct)
                .put("sessions", stats.sessions))
        }
        val settings = JSONObject()
            .put("accent", accent)
            .put("surface", surfaceStyle)
            .put("glass", glassIntensity)
            .put("glassBackground", glassBackground)
            .put("glassBlur", glassBlur)
            .put("glassClarity", glassClarity)
            .put("glassReflection", glassReflection)
            .put("dark", darkMode)
            .put("largeText", largeText)
            .put("feedback", showAnswersImmediately)
            .put("language", studyLanguage)
            .put("dailyTarget", dailyQuestionTarget)
            .put("readingTextSize", readingTextSize)
        return JSONObject()
            .put("format", "shtemarm-progress-backup")
            .put("version", 1)
            .put("stats", statsJson)
            .put("bookmarks", bookmarks)
            .put("mistakes", mistakes)
            .put("chapters", chapters)
            .put("lastBook", lastBook?.let { JSONObject().put("asset", it.asset)
                .put("title", it.title) } ?: JSONObject.NULL)
            .put("settings", settings)
            .toString(2)
    }

    /** Validate the complete file before touching existing local progress. */
    fun importSnapshot(contents: String): Boolean {
        if (contents.length !in 5..1_048_576) return false
        return try {
            val json = JSONObject(contents)
            if (json.optString("format") != "shtemarm-progress-backup" ||
                json.optInt("version") != 1) return false
            val statsObj = json.getJSONObject("stats")
            val bookmarksArray = json.getJSONArray("bookmarks")
            // 0.1.1 backups did not yet contain mistakes or recent books.
            val missedArray = json.optJSONArray("mistakes") ?: JSONArray()
            val chaptersData = json.optJSONObject("chapters") ?: JSONObject()
            if (chaptersData.length() > 5000) return false
            val lastBookData = json.optJSONObject("lastBook")
            val settings = json.getJSONObject("settings")
            if (bookmarksArray.length() > 10000 || missedArray.length() > 2000) return false
            val restored = mutableMapOf<String, SubjectStats>()
            for (subject in BookCatalog.subjects + "Կրկնություն") {
                val record = statsObj.getJSONObject(subject)
                val answered = record.getInt("answered")
                val correct = record.getInt("correct")
                val sessions = record.getInt("sessions")
                if (answered !in 0..10000000 || correct !in 0..answered ||
                    sessions !in 0..10000000) return false
                restored[subject] = SubjectStats(answered, correct, sessions)
            }
            val bookmarks = mutableSetOf<String>()
            for (i in 0 until bookmarksArray.length()) {
                val id = bookmarksArray.getString(i)
                if (id.length !in 1..256) return false
                bookmarks.add(id)
            }
            val mistakes = mutableSetOf<String>()
            for (i in 0 until missedArray.length()) {
                val id = missedArray.getString(i)
                if (id.length !in 1..256) return false
                mistakes.add(id)
            }
            val recentBook = lastBookData?.let { record ->
                val asset = record.getString("asset")
                val title = record.getString("title")
                BookCatalog.books.firstOrNull { it.asset == asset && it.title == title }
            }
            val chapters = mutableMapOf<String, SubjectStats>()
            for (key in chaptersData.keys()) {
                if (!validChapterKey(key)) return false
                val entry = chaptersData.getJSONObject(key)
                val answered = entry.getInt("answered")
                val correct = entry.getInt("correct")
                val sessions = entry.getInt("sessions")
                if (answered !in 0..10000000 || correct !in 0..answered ||
                    sessions !in 0..10000000) return false
                chapters[key] = SubjectStats(answered, correct, sessions)
            }
            val restoredAccent = settings.getString("accent")
            val restoredSurface = settings.getString("surface")
            val restoredGlass = settings.getString("glass")
            if (restoredAccent !in setOf("teal", "blue", "violet", "emerald", "rose", "amber") ||
                restoredSurface !in setOf("classic", "soft", "liquid") ||
                !GlassVisualPolicy.isSupported(restoredGlass)) return false
            val restoredLanguage = settings.optString("language", studyLanguage).takeIf { it in setOf("hy", "en", "ru") } ?: "hy"
            val restoredTarget = settings.optInt("dailyTarget", 10).takeIf(StudyGoals::validTarget) ?: 10
            val restoredReadingTextSize = ReaderTypography.normalize(
                settings.optInt("readingTextSize", ReaderTypography.DEFAULT_TEXT_SIZE_SP)
            )
            val restoredBackdrop = GlassStudioPolicy.background(settings.optString("glassBackground", "aurora"))
            val restoredBlur = GlassStudioPolicy.blur(settings.optInt("glassBlur", 24))
            val restoredClarity = GlassStudioPolicy.clarity(settings.optInt("glassClarity", 62))
            val restoredReflection = GlassStudioPolicy.reflection(settings.optInt("glassReflection", 72))
            val editor = prefs.edit().clear().putString("study_language", restoredLanguage)
                .putInt("daily_question_target", restoredTarget)
                .putInt("reading_text_size", restoredReadingTextSize)
            for ((subject, stats) in restored) {
                val prefix = "s_" + subject + "_"
                editor.putInt(prefix + "answered", stats.answered)
                    .putInt(prefix + "correct", stats.correct)
                    .putInt(prefix + "sessions", stats.sessions)
            }
            for ((key, stats) in chapters) {
                val prefix = "ch_" + key + "_"
                editor.putInt(prefix + "answered", stats.answered)
                    .putInt(prefix + "correct", stats.correct)
                    .putInt(prefix + "sessions", stats.sessions)
            }
            editor.putStringSet("bookmarks", bookmarks)
                .putStringSet("mistakes", mistakes)
                .putString("last_book_asset", recentBook?.asset)
                .putString("last_book_title", recentBook?.title)
                .putString("accent", restoredAccent)
                .putString("surface_style", restoredSurface)
                .putString("glass_intensity", restoredGlass)
                .putString("glass_background", restoredBackdrop)
                .putInt("glass_blur", restoredBlur)
                .putInt("glass_clarity", restoredClarity)
                .putInt("glass_reflection", restoredReflection)
                .putBoolean("dark_mode", settings.getBoolean("dark"))
                .putBoolean("large_text", settings.getBoolean("largeText"))
                .putBoolean("immediate_feedback", settings.getBoolean("feedback"))
                .commit()
        } catch (_: Exception) {
            false
        }
    }

    fun isBookmarked(id: String): Boolean =
        prefs.getStringSet("bookmarks", emptySet())?.contains(id) == true

    fun toggleBookmark(id: String): Boolean {
        val items = prefs.getStringSet("bookmarks", emptySet()).orEmpty().toMutableSet()
        val saved = if (id in items) { items.remove(id); false } else { items.add(id); true }
        prefs.edit().putStringSet("bookmarks", items).apply()
        return saved
    }

    fun bookmarkedIds(): Set<String> = prefs.getStringSet("bookmarks", emptySet()).orEmpty().toSet()

    var accent: String
        get() = prefs.getString("accent", "teal") ?: "teal"
        set(value) {
            if (value in setOf("teal", "blue", "violet", "emerald", "rose", "amber")) {
                prefs.edit().putString("accent", value).apply()
            }
        }

    var surfaceStyle: String
        get() = prefs.getString("surface_style", "liquid") ?: "liquid"
        set(value) {
            if (value in setOf("classic", "soft", "liquid")) {
                prefs.edit().putString("surface_style", value).apply()
            }
        }

    var glassIntensity: String
        get() = prefs.getString("glass_intensity", "balanced") ?: "balanced"
        set(value) {
            if (GlassVisualPolicy.isSupported(value)) {
                prefs.edit().putString("glass_intensity", value).apply()
            }
        }

    var glassBackground: String
        get() = GlassStudioPolicy.background(prefs.getString("glass_background", "aurora") ?: "aurora")
        set(value) { prefs.edit().putString("glass_background", GlassStudioPolicy.background(value)).apply() }

    var glassBlur: Int
        get() = GlassStudioPolicy.blur(prefs.getInt("glass_blur", 24))
        set(value) { prefs.edit().putInt("glass_blur", GlassStudioPolicy.blur(value)).apply() }

    var glassClarity: Int
        get() = GlassStudioPolicy.clarity(prefs.getInt("glass_clarity", 62))
        set(value) { prefs.edit().putInt("glass_clarity", GlassStudioPolicy.clarity(value)).apply() }

    var glassReflection: Int
        get() = GlassStudioPolicy.reflection(prefs.getInt("glass_reflection", 72))
        set(value) { prefs.edit().putInt("glass_reflection", GlassStudioPolicy.reflection(value)).apply() }

    var darkMode: Boolean
        get() = prefs.getBoolean("dark_mode", false)
        set(value) { prefs.edit().putBoolean("dark_mode", value).apply() }

    var largeText: Boolean
        get() = prefs.getBoolean("large_text", false)
        set(value) { prefs.edit().putBoolean("large_text", value).apply() }

    var readingTextSize: Int
        get() = ReaderTypography.normalize(prefs.getInt("reading_text_size", ReaderTypography.DEFAULT_TEXT_SIZE_SP))
        set(value) { prefs.edit().putInt("reading_text_size", ReaderTypography.normalize(value)).apply() }

    var showAnswersImmediately: Boolean
        get() = prefs.getBoolean("immediate_feedback", true)
        set(value) { prefs.edit().putBoolean("immediate_feedback", value).apply() }
}
