package am.shtemarm.app

/** Local study targets. No leaderboard or network sharing. */
object StudyGoals {
    val allowedDailyTargets = setOf(5, 10, 15, 20, 30)
    fun validTarget(target: Int) = target in allowedDailyTargets
    fun remaining(target: Int, answeredToday: Int): Int = (target - answeredToday).coerceAtLeast(0)
    fun completion(target: Int, answeredToday: Int): Float =
        (answeredToday.toFloat() / target.coerceAtLeast(1)).coerceIn(0f, 1f)
}
