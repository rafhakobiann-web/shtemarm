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
    shape: RoundedCornerShape = RoundedCornerShape(23.dp),
    backdropBlur: Boolean = false,
    content: @Composable BoxScope.() -> Unit
) {
    // Matte, opaque surfaces keep study screens calm and avoid blur work while scrolling.
    val liquid = false
    val intensity = LocalGlassIntensity.current
    val ultra = liquid && intensity == "ultra"
    val blur = GlassStudioPolicy.blur(LocalGlassBlur.current)
    val clarity = GlassStudioPolicy.clarity(LocalGlassClarity.current) / 100f
    val reflection = GlassStudioPolicy.reflection(LocalGlassReflection.current) / 100f
    val hazeState = LocalGlassHazeState.current
    val actualBlur = liquid && backdropBlur && hazeState != null && Build.VERSION.SDK_INT >= 32
    val scheme = MaterialTheme.colorScheme
    val dark = scheme.background.red < 0.30f
    val strength = GlassVisualPolicy.strength(intensity)
    val glow = if (dark) Color(0xFF96F5E5) else Color.White
    val low = if (dark) Color(0xFF19383F) else Color(0xFFE6F8F3)
    // Do not rebuild gradient objects on every Compose state update or scroll.
    val fill = remember(liquid, ultra, dark, strength, scheme.surface, actualBlur, clarity) {
        if (liquid) Brush.linearGradient(
            listOf(
                glow.copy(alpha = (if (actualBlur) (if (dark) 0.10f else 0.32f)
                    else (if (dark) 0.17f else if (ultra) 0.49f else 0.94f)) * strength),
                scheme.surface.copy(alpha = if (actualBlur) (0.47f - clarity * 0.37f)
                    else GlassVisualPolicy.surfaceAlpha(intensity, dark)),
                low.copy(alpha = (if (ultra) (if (dark) 0.42f else 0.35f)
                    else (if (dark) 0.76f else 0.59f)) * strength)
            )
        ) else Brush.verticalGradient(listOf(scheme.surface, scheme.surface))
    }
    val outline = if (liquid) glow.copy(alpha = GlassVisualPolicy.rimAlpha(intensity, dark) * strength * (0.45f + reflection * 0.55f))
                  else scheme.outline.copy(alpha = 0.68f)
    Box(
        modifier
            .shadow(if (liquid) 12.dp else 1.dp, shape, ambientColor = scheme.primary.copy(alpha = 0.16f),
                spotColor = scheme.primary.copy(alpha = 0.19f))
            .clip(shape)
            .then(if (actualBlur && blur > 0) Modifier.hazeEffect(state = requireNotNull(hazeState)) {
                blurRadius = blur.dp
                noiseFactor = 0.045f
            } else Modifier)
            .background(fill)
            .border(BorderStroke(1.dp, outline), shape)
    ) {
        if (liquid) {
            // Layered reflection + top rim highlight. Draw-only: no touch blocking,
            // no background capture, and no costly RenderEffect on scrolling lists.
            // Cache size-dependent shaders instead of allocating gradients
            // during every frame while a book list is moving.
            Spacer(
                Modifier.matchParentSize().drawWithCache {
                    val radius = maxOf(size.width, size.height).coerceAtLeast(1f)
                    val reflected = Brush.radialGradient(
                        colors = listOf(
                            Color.White.copy(alpha = (if (dark) 0.13f else 0.29f) * strength * reflection),
                            Color.White.copy(alpha = 0.045f * strength),
                            Color.Transparent
                        ),
                        center = Offset(size.width * 0.12f, size.height * 0.02f),
                        radius = radius * 0.9f
                    )
                    val edgeTint = Brush.linearGradient(
                        colors = listOf(
                            Color.Transparent,
                            scheme.primary.copy(alpha = (if (dark) 0.13f else 0.075f) * strength)
                        ),
                        start = Offset(size.width * 0.35f, 0f),
                        end = Offset(size.width, size.height)
                    )
                    val topGlint = Brush.horizontalGradient(
                        listOf(
                            Color.Transparent,
                            Color.White.copy(alpha = (if (dark) 0.32f else 0.9f) * strength * reflection),
                            Color.White.copy(alpha = 0.24f * strength),
                            Color.Transparent
                        )
                    )
                    // Ultra is an opt-in high-detail optical approximation, not
                    // an expensive live backdrop capture or an actual refraction shader.
                    val leftGlint = if (ultra) Brush.verticalGradient(
                        listOf(Color.Transparent,
                            Color.White.copy(alpha = if (dark) 0.19f else 0.60f),
                            Color.Transparent),
                        startY = 0f,
                        endY = size.height.coerceAtLeast(1f)
                    ) else null
                    val bottomGlint = if (ultra) Brush.horizontalGradient(
                        listOf(Color.Transparent,
                            scheme.primary.copy(alpha = if (dark) 0.21f else 0.10f),
                            Color.White.copy(alpha = if (dark) 0.14f else 0.54f),
                            Color.Transparent)
                    ) else null
                    onDrawBehind {
                        drawRect(brush = reflected)
                        drawRect(brush = edgeTint)
                        drawLine(
                            brush = topGlint,
                            start = Offset(size.width * 0.07f, 1.4f),
                            end = Offset(size.width * 0.93f, 1.4f),
                            strokeWidth = 1.6f
                        )
                        leftGlint?.let { brush ->
                            drawLine(
                                brush = brush,
                                start = Offset(1.5f, size.height * 0.10f),
                                end = Offset(1.5f, size.height * 0.89f),
                                strokeWidth = 1.6f
                            )
                        }
                        bottomGlint?.let { brush ->
                            drawLine(
                                brush = brush,
                                start = Offset(size.width * 0.12f, size.height - 1.5f),
                                end = Offset(size.width * 0.88f, size.height - 1.5f),
                                strokeWidth = 1.4f
                            )
                        }
                    }
                }
            )
        }
        content()
    }
}

@Composable
fun AcademyAmbientBackdrop(modifier: Modifier = Modifier, content: @Composable BoxScope.() -> Unit) {
    // Matte, opaque surfaces keep study screens calm and avoid blur work while scrolling.
    val liquid = false
    val scheme = MaterialTheme.colorScheme
    val dark = scheme.background.red < 0.30f
    val hazeState = LocalGlassHazeState.current
    val backdrop = GlassStudioPolicy.background(LocalGlassBackdrop.current)
    val backdropBrush = remember(liquid, dark, scheme.background, backdrop) {
        if (liquid) Brush.verticalGradient(
            listOf(
                when (backdrop) {
                    "paper" -> if (dark) Color(0xFF272630) else Color(0xFFFFFCF4)
                    "ink" -> if (dark) Color(0xFF0B1423) else Color(0xFFEAF1F5)
                    else -> if (dark) Color(0xFF0B1931) else Color(0xFFEAF8FB)
                },
                when (backdrop) {
                    "paper" -> if (dark) Color(0xFF2F2A2A) else Color(0xFFF9F5ED)
                    "ink" -> if (dark) Color(0xFF111B28) else Color(0xFFF5F7F9)
                    else -> if (dark) Color(0xFF24314F) else Color(0xFFF0F0FE)
                },
                when (backdrop) {
                    "paper" -> if (dark) Color(0xFF211F26) else Color(0xFFFFFEF9)
                    "ink" -> if (dark) Color(0xFF0D1822) else Color(0xFFEAF1F5)
                    else -> if (dark) Color(0xFF112B33) else Color(0xFFE9F9F1)
                }
            )
        ) else Brush.verticalGradient(listOf(scheme.background, scheme.background))
    }
    Box(modifier) {
        // Record ONLY the actual background layer so the Haze surface does not
        // capture (and recursively blur) controls or the foreground text.
        Box(
            Modifier.matchParentSize()
                .then(if (liquid && hazeState != null) Modifier.hazeSource(state = hazeState) else Modifier)
                .background(backdropBrush)
        ) {
            if (liquid) {
                Spacer(Modifier.matchParentSize().drawWithCache {
                    val teal = Brush.radialGradient(
                        colors = listOf(
                            scheme.primary.copy(alpha = if (dark) 0.23f else 0.20f),
                            scheme.primary.copy(alpha = if (dark) 0.065f else 0.035f),
                            Color.Transparent
                        ),
                        center = Offset(size.width * 0.96f, size.height * 0.08f),
                        radius = (size.width * 0.92f).coerceAtLeast(1f)
                    )
                    val gold = Brush.radialGradient(
                        colors = listOf(
                            (if (backdrop == "aurora") Color(0xFFAF72F4) else Color(0xFFE3B95F))
                            .copy(alpha = if (dark) 0.24f else 0.18f),
                            Color.Transparent
                        ),
                        center = Offset(size.width * 0.03f, size.height * 0.79f),
                        radius = (size.width * 0.79f).coerceAtLeast(1f)
                    )
                    onDrawBehind {
                        drawRect(brush = teal)
                        drawRect(brush = gold)
                    }
                })
            }
        }
        content()
    }
}
