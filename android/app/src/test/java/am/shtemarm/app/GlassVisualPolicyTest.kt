package am.shtemarm.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GlassVisualPolicyTest {
    @Test fun everyVisiblePresetIsRestorable() {
        listOf("subtle", "balanced", "vivid", "ultra").forEach { preset ->
            assertTrue("The UI preset must be accepted by backup restoration: $preset",
                GlassVisualPolicy.isSupported(preset))
        }
        assertFalse(GlassVisualPolicy.isSupported("invalid"))
        assertFalse(GlassVisualPolicy.isSupported(""))
    }

    @Test fun presetsPreserveOriginalVisualStrengths() {
        assertEquals(0.52f, GlassVisualPolicy.strength("subtle"), 0.001f)
        assertEquals(0.74f, GlassVisualPolicy.strength("balanced"), 0.001f)
        assertEquals(1.00f, GlassVisualPolicy.strength("vivid"), 0.001f)
        assertEquals(1.00f, GlassVisualPolicy.strength("ultra"), 0.001f)
        assertEquals(0.74f, GlassVisualPolicy.strength("unexpected"), 0.001f)
    }

    @Test fun ultraIsTranslucentWithStrongerRimHighlights() {
        for (dark in listOf(false, true)) {
            assertTrue(GlassVisualPolicy.surfaceAlpha("ultra", dark) <
                GlassVisualPolicy.surfaceAlpha("balanced", dark))
            assertTrue(GlassVisualPolicy.rimAlpha("ultra", dark) >
                GlassVisualPolicy.rimAlpha("balanced", dark))
            assertTrue(GlassVisualPolicy.surfaceAlpha("ultra", dark) in 0f..1f)
            assertTrue(GlassVisualPolicy.rimAlpha("ultra", dark) in 0f..1f)
        }
    }
}
