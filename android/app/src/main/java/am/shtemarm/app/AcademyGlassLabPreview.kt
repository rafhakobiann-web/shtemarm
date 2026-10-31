package am.shtemarm.app

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.hazeSource

/**
 * A live visual reference, not a static screenshot. The two moving colored
 * discs are captured by Haze and blurred BEHIND the centered glass panel.
 * This is deliberately isolated from book/exam content.
 */
@Composable
fun AcademyGlassLabPreview() {
    val previewState = remember { HazeState() }
    val scheme = MaterialTheme.colorScheme
    val dark = scheme.background.red < 0.30f
    val movement = rememberInfiniteTransition(label = "studio backdrop")
    val travel = movement.animateFloat(
        initialValue = .23f,
        targetValue = .73f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 6500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "liquid color"
    )
    CompositionLocalProvider(LocalGlassHazeState provides previewState) {
        Box(
            Modifier.fillMaxWidth().height(207.dp)
                .clip(RoundedCornerShape(29.dp))
                .background(
                    Brush.linearGradient(
                        if (dark) listOf(Color(0xFF0B2345), Color(0xFF202850), Color(0xFF093F45))
                        else listOf(Color(0xFFC5F1EF), Color(0xFFE4DFF9), Color(0xFFDDF6F2))
                    )
                )
        ) {
            Canvas(Modifier.matchParentSize().hazeSource(previewState)) {
                drawRect(
                    Brush.linearGradient(
                        if (dark) listOf(Color(0xFF0B2345), Color(0xFF202850), Color(0xFF093F45))
                        else listOf(Color(0xFFC5F1EF), Color(0xFFE4DFF9), Color(0xFFDDF6F2))
                    )
                )
                drawCircle(
                    color = Color(0xFF54D9CD).copy(alpha = .88f),
                    radius = size.minDimension * .37f,
                    center = Offset(size.width * travel.value, size.height * .21f)
                )
                drawCircle(
                    color = Color(0xFFB58AF4).copy(alpha = .76f),
                    radius = size.minDimension * .37f,
                    center = Offset(size.width * (1f - travel.value), size.height * .85f)
                )
                drawCircle(
                    color = Color(0xFFFFCD91).copy(alpha = .48f),
                    radius = size.minDimension * .18f,
                    center = Offset(size.width * .80f, size.height * .80f)
                )
            }
            AcademyGlassPanel(
                modifier = Modifier.align(Alignment.Center)
                    .fillMaxWidth(.86f),
                shape = RoundedCornerShape(29.dp),
                backdropBlur = true
            ) {
                Column(
                    Modifier.fillMaxWidth().padding(horizontal = 19.dp, vertical = 18.dp),
                    verticalArrangement = Arrangement.spacedBy(9.dp)
                ) {
                    Text(
                        "Shtemarm",
                        fontFamily = StudyReadingFont,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 27.sp,
                        color = scheme.onSurface
                    )
                    Text(
                        "Liquid Glass · Live Preview",
                        fontSize = 12.sp,
                        color = scheme.onSurfaceVariant
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier.size(8.dp).clip(RoundedCornerShape(50))
                                .background(scheme.primary)
                        )
                        Text(
                            "  Փոփոխությունները երևում են այստեղ",
                            color = scheme.onSurface,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }
    }
}
