package am.shtemarm.app

import org.junit.Assert.assertEquals
import org.junit.Test

class GlassStudioPolicyTest {
    @Test fun studioValuesAreAlwaysSafeToRender() {
        assertEquals(0, GlassStudioPolicy.blur(-20))
        assertEquals(48, GlassStudioPolicy.blur(500))
        assertEquals(24, GlassStudioPolicy.blur(24))
        assertEquals(20, GlassStudioPolicy.clarity(-1))
        assertEquals(100, GlassStudioPolicy.clarity(999))
        assertEquals(0, GlassStudioPolicy.reflection(-1))
        assertEquals(100, GlassStudioPolicy.reflection(105))
    }

    @Test fun unsupportedBackgroundFallsBackToAurora() {
        assertEquals("aurora", GlassStudioPolicy.background(""))
        assertEquals("aurora", GlassStudioPolicy.background("unknown"))
        assertEquals("paper", GlassStudioPolicy.background("paper"))
        assertEquals("ink", GlassStudioPolicy.background("ink"))
        assertEquals("aurora", GlassStudioPolicy.background("aurora"))
    }
}
