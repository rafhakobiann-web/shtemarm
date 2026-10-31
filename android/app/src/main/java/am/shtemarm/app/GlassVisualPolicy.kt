package am.shtemarm.app

/**
 * Pure, device-independent values for the native Liquid Glass presets.
 * This remains usable from local unit tests (without an Android runtime).
 */
internal object GlassVisualPolicy {
    private val supported = setOf("subtle", "balanced", "vivid", "ultra")

    fun isSupported(intensity: String): Boolean = intensity in supported

    fun strength(intensity: String): Float = when (intensity) {
        "subtle" -> 0.52f
        "vivid", "ultra" -> 1.0f
        else -> 0.74f
    }

    /** The central panel tint remains readable; Ultra is more translucent. */
    fun surfaceAlpha(intensity: String, dark: Boolean): Float =
        if (intensity == "ultra") {
            if (dark) 0.48f else 0.64f
        } else {
            if (dark) 0.67f else 0.89f
        }

    /** More pronounced rim lighting only for an explicitly chosen Ultra preset. */
    fun rimAlpha(intensity: String, dark: Boolean): Float =
        if (intensity == "ultra") {
            if (dark) 0.62f else 0.93f
        } else {
            if (dark) 0.26f else 0.86f
        }
}
