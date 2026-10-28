package am.shtemarm.app

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
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

/**
 * Original, Android-native frosted/liquid-glass visual treatment.
 * This uses translucent gradients, borders and specular highlights.
 * It does NOT claim to optically blur arbitrary UI behind a panel.
 * Opaque, lower-cost styling is retained for Soft and Classic presets.
 */
val LocalGlassIntensity = compositionLocalOf { "balanced" }

@Composable
fun AcademyGlassPanel(
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = RoundedCornerShape(23.dp),
    content: @Composable BoxScope.() -> Unit
) {
    val liquid = LocalAcademySurface.current == "liquid"
    val intensity = LocalGlassIntensity.current
    val scheme = MaterialTheme.colorScheme
    val dark = scheme.background.red < 0.30f
    val strength = when (intensity) {
        "subtle" -> 0.52f
        "vivid" -> 1.0f
        else -> 0.74f
    }
    val glow = if (dark) Color(0xFF96F5E5) else Color.White
    val low = if (dark) Color(0xFF19383F) else Color(0xFFE6F8F3)
    // Do not rebuild gradient objects on every Compose state update or scroll.
    val fill = remember(liquid, dark, strength, scheme.surface) {
        if (liquid) Brush.linearGradient(
            listOf(
                glow.copy(alpha = (if (dark) 0.17f else 0.94f) * strength),
                scheme.surface.copy(alpha = if (dark) 0.67f else 0.89f),
                low.copy(alpha = (if (dark) 0.76f else 0.59f) * strength)
            )
        ) else Brush.verticalGradient(listOf(scheme.surface, scheme.surface))
    }
    val outline = if (liquid) glow.copy(alpha = (if (dark) 0.26f else 0.86f) * strength)
                  else scheme.outline.copy(alpha = 0.68f)
    Box(
        modifier
            .shadow(if (liquid) 12.dp else 2.dp, shape, ambientColor = scheme.primary.copy(alpha = 0.16f),
                spotColor = scheme.primary.copy(alpha = 0.19f))
            .clip(shape)
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
                            Color.White.copy(alpha = (if (dark) 0.13f else 0.29f) * strength),
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
                            Color.White.copy(alpha = (if (dark) 0.32f else 0.9f) * strength),
                            Color.White.copy(alpha = 0.24f * strength),
                            Color.Transparent
                        )
                    )
                    onDrawBehind {
                        drawRect(brush = reflected)
                        drawRect(brush = edgeTint)
                        drawLine(
                            brush = topGlint,
                            start = Offset(size.width * 0.07f, 1.4f),
                            end = Offset(size.width * 0.93f, 1.4f),
                            strokeWidth = 1.6f
                        )
                    }
                }
            )
        }
        content()
    }
}

@Composable
fun AcademyAmbientBackdrop(modifier: Modifier = Modifier, content: @Composable BoxScope.() -> Unit) {
    val liquid = LocalAcademySurface.current == "liquid"
    val scheme = MaterialTheme.colorScheme
    val dark = scheme.background.red < 0.30f
    Box(modifier.background(
        if (liquid) Brush.verticalGradient(
            listOf(
                if (dark) Color(0xFF14292F) else Color(0xFFF8FCF6),
                if (dark) Color(0xFF182F35) else Color(0xFFF4FAF5),
                if (dark) Color(0xFF1B2932) else Color(0xFFFAFBF6)
            )
        ) else Brush.verticalGradient(listOf(scheme.background, scheme.background))
    )) {
        if (liquid) {
            Canvas(Modifier.fillMaxSize()) {
                drawCircle(
                    color = scheme.primary.copy(alpha = if (dark) 0.105f else 0.068f),
                    radius = size.width * 0.74f,
                    center = Offset(size.width * 0.96f, size.height * 0.08f)
                )
                drawCircle(
                    color = Color(0xFFE3B95F).copy(alpha = if (dark) 0.035f else 0.067f),
                    radius = size.width * 0.62f,
                    center = Offset(size.width * 0.03f, size.height * 0.79f)
                )
            }
        }
        content()
    }
}
