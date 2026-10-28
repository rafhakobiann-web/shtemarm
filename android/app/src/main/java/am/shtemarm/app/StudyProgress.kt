package am.shtemarm.app

import android.content.Context

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

    fun saveSession(subject: String, correct: Int, answered: Int) {
        if (answered <= 0 || correct < 0 || correct > answered) return
        val prefix = "s_" + subject + "_"
        val current = stats(subject)
        prefs.edit()
            .putInt(prefix + "answered", current.answered + answered)
            .putInt(prefix + "correct", current.correct + correct)
            .putInt(prefix + "sessions", current.sessions + 1)
            .apply()
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
