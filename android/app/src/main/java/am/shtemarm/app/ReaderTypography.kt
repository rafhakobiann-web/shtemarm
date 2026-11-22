package am.shtemarm.app

/** Safe, bounded typography controls for the offline passage reader. */
object ReaderTypography {
    const val MIN_TEXT_SIZE_SP = 14
    const val MAX_TEXT_SIZE_SP = 26
    const val DEFAULT_TEXT_SIZE_SP = 16

    fun normalize(sizeSp: Int): Int = sizeSp.coerceIn(MIN_TEXT_SIZE_SP, MAX_TEXT_SIZE_SP)
    fun decrease(sizeSp: Int): Int = (normalize(sizeSp) - 1).coerceAtLeast(MIN_TEXT_SIZE_SP)
    fun increase(sizeSp: Int): Int = (normalize(sizeSp) + 1).coerceAtMost(MAX_TEXT_SIZE_SP)
}
