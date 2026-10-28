package am.shtemarm.app

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Mirrors the web app's primary "Noto Sans Armenian" UI typeface.
 * The font and its OFL license are bundled in android/; no network call required.
 * Spacing avoids overly loose tracking and clipped Armenian ascenders.
 */
private val AcademyArmenian = FontFamily(
    Font(R.font.noto_sans_armenian, weight = FontWeight.Normal),
    Font(R.font.noto_sans_armenian, weight = FontWeight.Medium),
    Font(R.font.noto_sans_armenian, weight = FontWeight.SemiBold),
    Font(R.font.noto_sans_armenian, weight = FontWeight.Bold),
    Font(R.font.noto_sans_armenian, weight = FontWeight.ExtraBold),
    Font(R.font.noto_sans_armenian, weight = FontWeight.Black)
)

val ShtemarmTypography = Typography(
    displayLarge = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Black,
        fontSize = 42.sp, lineHeight = 54.sp, letterSpacing = 0.sp),
    displayMedium = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Black,
        fontSize = 36.sp, lineHeight = 47.sp, letterSpacing = 0.sp),
    displaySmall = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.ExtraBold,
        fontSize = 31.sp, lineHeight = 42.sp, letterSpacing = 0.sp),
    headlineLarge = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.ExtraBold,
        fontSize = 28.sp, lineHeight = 39.sp, letterSpacing = 0.sp),
    headlineMedium = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.ExtraBold,
        fontSize = 24.sp, lineHeight = 35.sp, letterSpacing = 0.sp),
    headlineSmall = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Bold,
        fontSize = 21.sp, lineHeight = 31.sp, letterSpacing = 0.sp),
    titleLarge = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Bold,
        fontSize = 20.sp, lineHeight = 30.sp, letterSpacing = 0.sp),
    titleMedium = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp, lineHeight = 26.sp, letterSpacing = 0.sp),
    titleSmall = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp, lineHeight = 23.sp, letterSpacing = 0.sp),
    bodyLarge = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Normal,
        fontSize = 16.sp, lineHeight = 27.sp, letterSpacing = 0.sp),
    bodyMedium = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Normal,
        fontSize = 14.sp, lineHeight = 24.sp, letterSpacing = 0.sp),
    bodySmall = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Normal,
        fontSize = 12.sp, lineHeight = 21.sp, letterSpacing = 0.sp),
    labelLarge = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Bold,
        fontSize = 14.sp, lineHeight = 23.sp, letterSpacing = 0.sp),
    labelMedium = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp, lineHeight = 20.sp, letterSpacing = 0.sp),
    labelSmall = TextStyle(fontFamily = AcademyArmenian, fontWeight = FontWeight.Medium,
        fontSize = 11.sp, lineHeight = 18.sp, letterSpacing = 0.sp)
)
