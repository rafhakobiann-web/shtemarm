package am.shtemarm.app

import android.os.Build
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.hazeEffect
import dev.chrisbanes.haze.hazeSource

/**
 * Original, Android-native frosted/liquid-glass visual treatment.
 * This uses translucent gradients, borders and specular highlights.
 * It does NOT claim to optically blur arbitrary UI behind a panel.
 * Opaque, lower-cost styling is retained for Soft and Classic presets.
 */
val LocalGlassIntensity = compositionLocalOf { "balanced" }
// Optional shared capture state. Only navigation glass uses real backdrop blur;
// scrolling question cards keep a cheap and readable frosted fallback.
val LocalGlassHazeState = compositionLocalOf<HazeState?> { null }
val LocalGlassBlur = compositionLocalOf { 24 }
val LocalGlassClarity = compositionLocalOf { 62 }
val LocalGlassReflection = compositionLocalOf { 72 }
val LocalGlassBackdrop = compositionLocalOf { "aurora" }

@Composable
fun AcademyGlassPanel(
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = RoundedCornerShape(16.dp),
    backdropBlur: Boolean = false,
    content: @Composable BoxScope.() -> Unit
) {
    val scheme = MaterialTheme.colorScheme
    Box(
        modifier
            .clip(shape)
            .background(scheme.surface)
            .border(BorderStroke(1.dp, scheme.outline.copy(alpha = 0.55f)), shape)
    ) {
        content()
    }
}

@Composable
fun AcademyAmbientBackdrop(modifier: Modifier = Modifier, content: @Composable BoxScope.() -> Unit) {
    Box(modifier.background(MaterialTheme.colorScheme.background)) {
        content()
    }
}
