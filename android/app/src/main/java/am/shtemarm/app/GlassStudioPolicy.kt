package am.shtemarm.app

/**
 * Values for the opt-in visual lab. No Android framework calls, so unit tests
 * can exercise limits and compatibility with previous local preferences.
 */
internal object GlassStudioPolicy {
    val backgrounds = setOf("aurora", "paper", "ink")
    fun background(value: String): String = value.takeIf { it in backgrounds } ?: "aurora"
    fun blur(value: Int): Int = value.coerceIn(0, 48)
    fun clarity(value: Int): Int = value.coerceIn(20, 100)
    fun reflection(value: Int): Int = value.coerceIn(0, 100)
}
