package am.shtemarm.app

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class SubjectStats(val answered: Int, val correct: Int, val sessions: Int) {
    val accuracy: Int get() = if (answered == 0) 0 else (correct * 100 / answered)
}

class StudyProgress(context: Context) {
    private val prefs = context.getSharedPreferences("shtemarm_native_v1", Context.MODE_PRIVATE)

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
    fun saveSessionOnce(subject: String, correct: Int, answered: Int, sessionId: String): Boolean {
        if (!SessionGuards.validSession(answered, correct, sessionId)) return false
        synchronized(this) {
            if (prefs.getString("last_completed_session", null) == sessionId) return false
            val prefix = "s_" + subject + "_"
            val current = stats(subject)
            // commit() is deliberate: scores and the de-duplication token
            // must reach disk in the same transaction before success.
            return prefs.edit()
                .putInt(prefix + "answered", current.answered + answered)
                .putInt(prefix + "correct", current.correct + correct)
                .putInt(prefix + "sessions", current.sessions + 1)
                .putString("last_completed_session", sessionId)
                .commit()
        }
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
        val settings = JSONObject()
            .put("accent", accent)
            .put("surface", surfaceStyle)
            .put("glass", glassIntensity)
            .put("dark", darkMode)
            .put("largeText", largeText)
            .put("feedback", showAnswersImmediately)
        return JSONObject()
            .put("format", "shtemarm-progress-backup")
            .put("version", 1)
            .put("stats", statsJson)
            .put("bookmarks", bookmarks)
            .put("mistakes", mistakes)
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
            val restoredAccent = settings.getString("accent")
            val restoredSurface = settings.getString("surface")
            val restoredGlass = settings.getString("glass")
            if (restoredAccent !in setOf("teal", "blue", "violet", "emerald", "rose", "amber") ||
                restoredSurface !in setOf("classic", "soft", "liquid") ||
                restoredGlass !in setOf("subtle", "balanced", "vivid")) return false
            val editor = prefs.edit().clear()
            for ((subject, stats) in restored) {
                val prefix = "s_" + subject + "_"
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
            if (value in setOf("subtle", "balanced", "vivid")) {
                prefs.edit().putString("glass_intensity", value).apply()
            }
        }

    var darkMode: Boolean
        get() = prefs.getBoolean("dark_mode", false)
        set(value) { prefs.edit().putBoolean("dark_mode", value).apply() }

    var largeText: Boolean
        get() = prefs.getBoolean("large_text", false)
        set(value) { prefs.edit().putBoolean("large_text", value).apply() }

    var showAnswersImmediately: Boolean
        get() = prefs.getBoolean("immediate_feedback", true)
        set(value) { prefs.edit().putBoolean("immediate_feedback", value).apply() }
}
