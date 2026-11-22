package am.shtemarm.app

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.foundation.clickable
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.Image
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.Spring
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// The colors and dimensions below are ported from src/styles.css, src/routes/index.tsx,
// AppHeader.tsx, and MobileNav.tsx. These are native Compose elements, NOT a WebView.
val AcademyTeal = Color(0xFF205B4D)
val AcademyInk = Color(0xFF202822)
val AcademyPaper = Color(0xFFF6F3EA)
val AcademyGold = Color(0xFFB85C3C)
private val AcademyLine = Color(0xFFDAD7CC)

val LocalAcademySurface = compositionLocalOf { "soft" }

fun academyAccent(id: String): Color = when (id) {
    "blue" -> Color(0xFF355C8A)
    "violet" -> Color(0xFF72516D)
    "emerald" -> Color(0xFF517652)
    "rose" -> Color(0xFFB65350)
    "amber" -> Color(0xFFAF7431)
    else -> AcademyTeal
}


fun academyColors(dark: Boolean, accent: Color, style: String): ColorScheme =
    if (dark) darkColorScheme(
        primary = if (accent == AcademyTeal) Color(0xFF1CB4A1) else accent,
        onPrimary = Color(0xFF092B27),
        primaryContainer = Color(0xFF29463D),
        background = Color(0xFF171D19),
        surface = Color(0xFF222A24),
        surfaceContainerHigh = Color(0xFF2B342D),
        onSurface = Color(0xFFF1EEE5),
        onSurfaceVariant = Color(0xFFB8B7AA),
        outline = Color(0xFF4D574F)
    ) else lightColorScheme(
        primary = accent,
        onPrimary = Color.White,
        primaryContainer = Color(0xFFE2ECE1),
        onPrimaryContainer = AcademyInk,
        secondary = AcademyGold,
        background = if (style == "classic") Color(0xFFFAF9F5) else AcademyPaper,
        surface = Color(0xFFFFFEFA),
        surfaceContainerHigh = Color(0xFFEEEAE0),
        onSurface = AcademyInk,
        onSurfaceVariant = Color(0xFF6D7066),
        outline = AcademyLine
    )

@Composable
fun AcademyLogo() {
    Box(
        Modifier.size(44.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.11f))
            .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.16f), RoundedCornerShape(14.dp)),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_launcher),
            contentDescription = "Shtemarm",
            modifier = Modifier.size(33.dp).clip(RoundedCornerShape(9.dp))
        )
    }
}


@Composable
fun AcademyTopBar(
    points: Int,
    onHome: () -> Unit,
    onProgress: () -> Unit,
    onSaved: () -> Unit,
    onSettings: () -> Unit
) {
    var menuOpen by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface)) {
        Row(
            Modifier.fillMaxWidth().windowInsetsPadding(WindowInsets.statusBars)
                .height(60.dp).padding(horizontal = 18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(Modifier.weight(1f).clickable(onClick = onHome), verticalAlignment = Alignment.CenterVertically) {
                AcademyLogo()
                Spacer(Modifier.width(10.dp))
                Text("Շտեմարմ", fontFamily = StudyReadingFont, fontWeight = FontWeight.Bold,
                    fontSize = 21.sp, color = MaterialTheme.colorScheme.onSurface)
            }
            TextButton(onClick = onProgress, contentPadding = PaddingValues(horizontal = 8.dp)) {
                Icon(Icons.Default.Star, null, tint = Color(0xFFAF7431), modifier = Modifier.size(17.dp))
                Spacer(Modifier.width(5.dp))
                Text(points.toString(), color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold)
            }
            Box {
                IconButton(onClick = { menuOpen = true }) {
                    Icon(Icons.Default.Menu, contentDescription = "Բացել ընտրացանկը",
                        tint = MaterialTheme.colorScheme.onSurface)
                }
                DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                    DropdownMenuItem(text = { Text("Գլխավոր") }, leadingIcon = { Icon(Icons.Default.Home, null) },
                        onClick = { menuOpen = false; onHome() })
                    DropdownMenuItem(text = { Text("Իմ առաջընթացը") }, leadingIcon = { Icon(Icons.Default.Star, null) },
                        onClick = { menuOpen = false; onProgress() })
                    DropdownMenuItem(text = { Text("Պահպանված հարցեր") }, leadingIcon = { Icon(Icons.Default.Book, null) },
                        onClick = { menuOpen = false; onSaved() })
                    DropdownMenuItem(text = { Text("Կարգավորումներ") }, leadingIcon = { Icon(Icons.Default.Settings, null) },
                        onClick = { menuOpen = false; onSettings() })
                }
            }
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = .65f))
    }
}


@Composable
fun AcademyFloatingDock(selected: Int, onSelect: (Int) -> Unit) {
    val tabs = listOf(
        Triple("Գլխավոր", Icons.Default.Home, 0),
        Triple("Գրքեր", Icons.Default.Book, 1),
        Triple("Թեստեր", Icons.Default.CheckCircle, 2),
        Triple("Խաղեր", Icons.Default.SportsEsports, 3),
        Triple("Գործիքներ", Icons.Default.Build, 4)
    )
    Column(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface)) {
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = .7f))
        Row(
            Modifier.fillMaxWidth().windowInsetsPadding(WindowInsets.navigationBars)
                .height(66.dp).padding(horizontal = 3.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            tabs.forEach { (label, icon, id) ->
                val active = selected.coerceIn(0, 4) == id
                Column(
                    modifier = Modifier.weight(1f).fillMaxHeight()
                        .selectable(selected = active, role = Role.Tab, onClick = { onSelect(id) })
                        .padding(top = 5.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(3.dp)
                ) {
                    Icon(icon, contentDescription = null,
                        tint = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(22.dp))
                    Text(label, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 10.sp,
                        fontWeight = if (active) FontWeight.Bold else FontWeight.Medium,
                        color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
                    Box(Modifier.width(18.dp).height(2.dp).clip(RoundedCornerShape(2.dp))
                        .background(if (active) MaterialTheme.colorScheme.primary else Color.Transparent))
                }
            }
        }
    }
}


@Composable
fun AcademyHero(onSubjects: () -> Unit, onExams: () -> Unit) {
    val palette = MaterialTheme.colorScheme
    Column(Modifier.fillMaxWidth().padding(top = 10.dp, bottom = 8.dp)) {
        Text("ՔՈ ՔՆՆՈՒԹՅՈՒՆԸ։ ՔՈ ՏԵՄՊԸ։", color = palette.primary,
            fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.1.sp)
        Spacer(Modifier.height(12.dp))
        Text("Սովորիր վստահ։\\nՔայլ առ քայլ։", color = palette.onSurface,
            fontFamily = StudyReadingFont, fontWeight = FontWeight.SemiBold,
            fontSize = 31.sp, lineHeight = 39.sp)
        Spacer(Modifier.height(9.dp))
        Text("Բացիր քո շտեմարանը, լուծիր հարցերը և տես՝ ինչն արդեն լավ գիտես։",
            color = palette.onSurfaceVariant, fontSize = 14.sp, lineHeight = 22.sp)
        Spacer(Modifier.height(18.dp))
        Button(onClick = onSubjects, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp),
            shape = RoundedCornerShape(12.dp), contentPadding = PaddingValues(horizontal = 16.dp, vertical = 13.dp)) {
            Icon(Icons.Default.Book, null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(9.dp))
            Text("Ընտրել առարկան", fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.weight(1f))
            Icon(Icons.Default.ArrowForward, null, modifier = Modifier.size(17.dp))
        }
        TextButton(onClick = onExams, modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(vertical = 10.dp)) {
            Icon(Icons.Default.CheckCircle, null, tint = palette.primary, modifier = Modifier.size(17.dp))
            Spacer(Modifier.width(8.dp))
            Text("Սկսել փորձնական քննություն", color = palette.onSurface, fontWeight = FontWeight.Medium)
        }
    }
}


@Composable
fun AcademyQuickAction(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick)
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(42.dp).clip(RoundedCornerShape(11.dp))
            .background(MaterialTheme.colorScheme.primary.copy(alpha = .09f)),
            contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(21.dp))
        }
        Spacer(Modifier.width(13.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp,
                color = MaterialTheme.colorScheme.onSurface)
            Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        Icon(Icons.Default.ArrowForward, null, tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(18.dp))
    }
    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = .55f))
}


@Composable
fun AcademySectionTitle(title: String) {
    Text(title, fontFamily = StudyReadingFont, fontWeight = FontWeight.SemiBold,
        fontSize = 23.sp, lineHeight = 31.sp, color = MaterialTheme.colorScheme.onSurface)
}

@Composable
fun AcademyEyebrow(label: String) {
    Text(label.uppercase(), color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.ExtraBold, letterSpacing = 1.1.sp, fontSize = 11.sp)
}

@Composable
fun AcademyStatCard(label: String, value: String, caption: String, icon: ImageVector) {
    AcademyGlassPanel(shape = RoundedCornerShape(22.dp)) {
        Column(Modifier.fillMaxWidth().padding(17.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(17.dp))
                Spacer(Modifier.width(7.dp))
                Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
            }
            Text(value, fontFamily = StudyReadingFont,
                fontWeight = FontWeight.SemiBold, fontSize = 27.sp)
            Text(caption, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
    }
}


private fun academySubjectColor(subject: String): Color = when (subject) {
    "Մաթեմատիկա" -> Color(0xFF355C8A)
    "Անգլերեն" -> Color(0xFF496C8C)
    "Կենսաբանություն" -> Color(0xFF517652)
    "Հայոց պատմություն" -> Color(0xFFB85C3C)
    "Հայոց լեզու" -> Color(0xFF72516D)
    "Ֆիզիկա" -> Color(0xFF47737A)
    "Քիմիա" -> Color(0xFFAF7431)
    "Աշխարհագրություն" -> Color(0xFF4F725D)
    "Ռուսերեն" -> Color(0xFF9B5550)
    else -> AcademyTeal
}

@Composable
fun AcademySubjectAccordion(
    subject: String,
    books: List<StudyBook>,
    initiallyExpanded: Boolean = false,
    onOpenSubject: () -> Unit,
    onOpenBook: (StudyBook) -> Unit
) {
    var expanded by rememberSaveable(subject) { mutableStateOf(initiallyExpanded) }
    val accent = academySubjectColor(subject)
    val chevronRotation by animateFloatAsState(
        targetValue = if (expanded) 180f else 0f,
        animationSpec = tween(durationMillis = 180),
        label = "accordion chevron"
    )
    Column(Modifier.fillMaxWidth()) {
        Row(
            Modifier.fillMaxWidth().clickable { expanded = !expanded }
                .padding(vertical = 15.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(Modifier.width(4.dp).height(42.dp).clip(RoundedCornerShape(3.dp)).background(accent))
            Spacer(Modifier.width(13.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(subject, fontWeight = FontWeight.SemiBold, fontSize = 17.sp,
                    color = MaterialTheme.colorScheme.onSurface)
                Text(books.size.toString() + " գիրք", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            Icon(Icons.Default.KeyboardArrowDown, null, tint = accent,
                modifier = Modifier.size(25.dp).graphicsLayer { rotationZ = chevronRotation })
        }
        AnimatedVisibility(
            visible = expanded,
            enter = expandVertically(animationSpec = tween(durationMillis = 180)) + fadeIn(animationSpec = tween(140)),
            exit = shrinkVertically(animationSpec = tween(durationMillis = 150)) + fadeOut(animationSpec = tween(120))
        ) {
            Column(Modifier.padding(start = 17.dp, bottom = 7.dp)) {
                books.forEach { book ->
                    Row(Modifier.fillMaxWidth().clickable { onOpenBook(book) }.padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.width(2.dp).height(34.dp).background(accent.copy(alpha = .5f)))
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(book.title, fontWeight = FontWeight.Medium, fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface)
                            Text("Բացել գիրքը", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
                        }
                        Icon(Icons.Default.ArrowForward, null, tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(16.dp))
                    }
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = .45f))
                }
                TextButton(onClick = onOpenSubject, contentPadding = PaddingValues(horizontal = 0.dp, vertical = 8.dp)) {
                    Text("Բոլոր գրքերը", color = accent, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.width(5.dp))
                    Icon(Icons.Default.ArrowForward, null, tint = accent, modifier = Modifier.size(16.dp))
                }
            }
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = .7f))
    }
}


@Composable
fun AcademyBookTile(book: StudyBook, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically) {
        AcademyMiniCover(book.subject, book.title)
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(book.title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp,
                color = MaterialTheme.colorScheme.onSurface)
            Text(book.subject, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("Բացել շտեմարանը →", fontWeight = FontWeight.Medium, fontSize = 12.sp,
                color = academySubjectColor(book.subject))
        }
    }
    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = .55f))
}


@Composable
fun AcademyMiniCover(subject: String, title: String) {
    val accent = academySubjectColor(subject)
    Column(
        Modifier.width(68.dp).height(91.dp).clip(RoundedCornerShape(4.dp))
            .background(accent).padding(start = 9.dp, top = 8.dp, end = 7.dp, bottom = 7.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text("ՇՏԵՄԱՐՄ", fontSize = 7.sp, fontWeight = FontWeight.Bold,
            color = Color.White.copy(alpha = .84f), letterSpacing = .35.sp)
        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Box(Modifier.width(17.dp).height(2.dp).background(Color.White.copy(alpha = .65f)))
            Text(subject, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold,
                maxLines = 3, lineHeight = 12.sp, overflow = TextOverflow.Ellipsis)
        }
        Text(title, color = Color.White.copy(alpha = .82f), fontSize = 7.sp, maxLines = 2,
            lineHeight = 8.sp, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
fun AcademyAppearanceSettings(
    dark: Boolean,
    onDark: (Boolean) -> Unit,
    accent: String,
    onAccent: (String) -> Unit,
    surface: String,
    onSurface: (String) -> Unit,
    glassIntensity: String,
    onGlassIntensity: (String) -> Unit,
    glassBackground: String,
    onGlassBackground: (String) -> Unit,
    glassBlur: Int,
    onGlassBlur: (Int) -> Unit,
    glassClarity: Int,
    onGlassClarity: (Int) -> Unit,
    glassReflection: Int,
    onGlassReflection: (Int) -> Unit,
    largeText: Boolean,
    onLargeText: (Boolean) -> Unit,
    immediateFeedback: Boolean,
    onFeedback: (Boolean) -> Unit,
    backupStatus: String,
    onExportBackup: () -> Unit,
    onImportBackup: () -> Unit
) {
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 18.dp),
        verticalArrangement = Arrangement.spacedBy(17.dp)
    ) {
        item {
            Spacer(Modifier.height(4.dp))
            AcademyEyebrow("Անհատականացում")
            Spacer(Modifier.height(9.dp))
            AcademySectionTitle("Կարգավորումներ")
            Spacer(Modifier.height(5.dp))
            Text("Հարմարեցրու քո ուսումնական միջավայրը։",
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
        }
        if (surface == "liquid") item {
            AcademyGlassLabPreview()
            Spacer(Modifier.height(8.dp))
            Text("Կենդանի նախադիտում. գույները շարժվում են իրական մշուշման հետևում։",
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        item {
            Text("Հավելվածի ոճը", fontWeight = FontWeight.Bold, fontSize = 17.sp)
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("classic" to "Դասական", "soft" to "Ակադեմիական")
                    .forEach { (value, label) ->
                        FilterChip(selected = surface == value, onClick = { onSurface(value) },
                            label = { Text(label) })
                    }
            }
        }
        if (surface == "liquid") item {
            Text("Ապակու էֆեկտ", fontWeight = FontWeight.Bold, fontSize = 17.sp)
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("subtle" to "Մեղմ", "balanced" to "Հավասարակշռված",
                    "vivid" to "Արտահայտիչ", "ultra" to "Ultra Glass").forEach { (value, label) ->
                    FilterChip(
                        selected = glassIntensity == value,
                        onClick = { onGlassIntensity(value) },
                        label = { Text(label) }
                    )
                }
            }
            Spacer(Modifier.height(5.dp))
            Text("Live blur-ը աշխատում է նավիգացիոն ապակու և նախադիտման վրա։ Բեկման շարժիչը դեռ փորձնական փուլում է։",
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        if (surface == "liquid") item {
            Text("Theme Studio", fontFamily = StudyReadingFont,
                fontWeight = FontWeight.SemiBold, fontSize = 22.sp)
            Spacer(Modifier.height(8.dp))
            Text("Ֆոնի ոճ", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Spacer(Modifier.height(6.dp))
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("aurora" to "Ավրորա", "paper" to "Թղթային",
                    "ink" to "Խորը մուգ").forEach { (value, title) ->
                    FilterChip(
                        selected = glassBackground == value,
                        onClick = { onGlassBackground(value) },
                        label = { Text(title) }
                    )
                }
            }
            Spacer(Modifier.height(10.dp))
            AcademyStudioSlider("Իրական մշուշում", "${glassBlur} dp",
                glassBlur.toFloat(), 0f..48f) { onGlassBlur(it.toInt()) }
            AcademyStudioSlider("Թափանցիկություն", "${glassClarity}%",
                glassClarity.toFloat(), 20f..100f) { onGlassClarity(it.toInt()) }
            AcademyStudioSlider("Լուսային անդրադարձումներ", "${glassReflection}%",
                glassReflection.toFloat(), 0f..100f) { onGlassReflection(it.toInt()) }
            Text("Blur-ը գործում է Android 12 և նոր տարբերակներում։ Ավելի հին սարքերի վրա պահպանվում է ընթեռնելի պարզեցված ոճը։",
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        item {
            Text("Շեշտադրման գույն", fontWeight = FontWeight.Bold, fontSize = 17.sp)
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                listOf("teal", "blue", "violet", "emerald", "rose", "amber").forEach { id ->
                    val color = academyAccent(id)
                    Box(
                        Modifier.size(44.dp).clip(RoundedCornerShape(14.dp))
                            .background(color)
                            .border(
                                width = if (accent == id) 3.dp else 1.dp,
                                color = if (accent == id) MaterialTheme.colorScheme.onSurface
                                        else MaterialTheme.colorScheme.outline,
                                shape = RoundedCornerShape(14.dp)
                            )
                            .clickable { onAccent(id) },
                        contentAlignment = Alignment.Center
                    ) {
                        if (accent == id) Icon(Icons.Default.CheckCircle, null,
                            tint = Color.White, modifier = Modifier.size(22.dp))
                    }
                }
            }
        }
        item {
            Surface(
                color = MaterialTheme.colorScheme.surface,
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = .6f))
            ) {
                Column(Modifier.padding(horizontal = 16.dp, vertical = 5.dp)) {
                    AcademyToggle("Մուգ թեմա", dark, onDark)
                    HorizontalDivider()
                    AcademyToggle("Խոշոր տեքստ", largeText, onLargeText)
                    HorizontalDivider()
                    AcademyToggle("Ցույց տալ ճիշտ պատասխանը", immediateFeedback, onFeedback)
                }
            }
        }
        item {
            Text("Արտաքին տեսքի ընտրությունները պահպանվում են այս սարքում։",
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        item {
            HorizontalDivider()
            Spacer(Modifier.height(7.dp))
            Text("Առաջընթացի պահուստավորում", fontWeight = FontWeight.Bold, fontSize = 17.sp)
            Spacer(Modifier.height(5.dp))
            Text("Պահպանիր արդյունքներն ու նշված հարցերը որպես JSON ֆայլ՝ հավելվածը վերատեղադրելուց առաջ։",
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            Spacer(Modifier.height(10.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                OutlinedButton(onClick = onExportBackup, modifier = Modifier.weight(1f)) {
                    Text("Պահպանել", fontSize = 13.sp)
                }
                OutlinedButton(onClick = onImportBackup, modifier = Modifier.weight(1f)) {
                    Text("Վերականգնել", fontSize = 13.sp)
                }
            }
            if (backupStatus.isNotBlank()) {
                Text(backupStatus, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
            }
            Spacer(Modifier.height(12.dp))
        }
    }
}

@Composable
private fun AcademyStudioSlider(
    label: String,
    valueText: String,
    value: Float,
    range: ClosedFloatingPointRange<Float>,
    onChange: (Float) -> Unit
) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
        Text(valueText, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
    }
    Slider(
        value = value.coerceIn(range.start, range.endInclusive),
        onValueChange = onChange,
        valueRange = range
    )
}

@Composable
private fun AcademyToggle(title: String, value: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 56.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, fontSize = 15.sp, modifier = Modifier.weight(1f))
        Switch(checked = value, onCheckedChange = onChange)
    }
}


@Composable
fun AcademyBookSectionCard(
    index: Int,
    title: String,
    count: Int,
    attempts: Int = 0,
    answered: Int = 0,
    correct: Int = 0,
    onPlay: () -> Unit,
    onClassic: () -> Unit,
    onTest: () -> Unit
) {
    val palette = MaterialTheme.colorScheme
    Column(Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth().padding(vertical = 15.dp), verticalAlignment = Alignment.Top) {
            Text(index.toString().padStart(2, '0'), color = palette.primary,
                fontFamily = StudyReadingFont, fontSize = 20.sp, fontWeight = FontWeight.Medium,
                modifier = Modifier.width(42.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(title, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = palette.onSurface)
                Text(count.toString() + " հարց", color = palette.onSurfaceVariant, fontSize = 12.sp)
                if (attempts > 0 && answered > 0) {
                    val accuracy = (correct * 100 / answered).coerceIn(0, 100)
                    Text("Վարժանքներ՝ $attempts · Ճշտություն՝ $accuracy%",
                        color = palette.primary, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(start = 42.dp, bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            Button(onClick = onPlay, modifier = Modifier.weight(1f).heightIn(min = 42.dp),
                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp),
                shape = RoundedCornerShape(9.dp)) { Text("Խաղալ", fontSize = 11.sp) }
            OutlinedButton(onClick = onClassic, modifier = Modifier.weight(1f).heightIn(min = 42.dp),
                contentPadding = PaddingValues(horizontal = 3.dp, vertical = 8.dp),
                shape = RoundedCornerShape(9.dp)) { Text("Դասական", fontSize = 11.sp) }
            OutlinedButton(onClick = onTest, modifier = Modifier.weight(1f).heightIn(min = 42.dp),
                contentPadding = PaddingValues(horizontal = 3.dp, vertical = 8.dp),
                shape = RoundedCornerShape(9.dp)) { Text("Թեստ", fontSize = 11.sp) }
        }
        HorizontalDivider(color = palette.outlineVariant.copy(alpha = .7f))
    }
}

