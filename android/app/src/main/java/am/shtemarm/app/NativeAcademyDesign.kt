package am.shtemarm.app

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.Image
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// The colors and dimensions below are ported from src/styles.css, src/routes/index.tsx,
// AppHeader.tsx, and MobileNav.tsx. These are native Compose elements, NOT a WebView.
val AcademyTeal = Color(0xFF0B766B)
val AcademyInk = Color(0xFF20353B)
val AcademyPaper = Color(0xFFF9FBF5)
val AcademyGold = Color(0xFFE3B95F)
private val AcademyLine = Color(0xFFDDE7DF)

val LocalAcademySurface = compositionLocalOf { "liquid" }

fun academyAccent(id: String): Color = when (id) {
    "blue" -> Color(0xFF4263EB)
    "violet" -> Color(0xFF7C3AED)
    "emerald" -> Color(0xFF059669)
    "rose" -> Color(0xFFE11D48)
    "amber" -> Color(0xFFB7791F)
    else -> AcademyTeal
}


fun academyColors(dark: Boolean, accent: Color, style: String): ColorScheme =
    if (dark) darkColorScheme(
        primary = if (accent == AcademyTeal) Color(0xFF1CB4A1) else accent,
        onPrimary = Color(0xFF092B27),
        primaryContainer = Color(0xFF204E4B),
        background = Color(0xFF19292F),
        surface = Color(0xFF23353B),
        surfaceContainerHigh = Color(0xFF2C4146),
        onSurface = Color(0xFFF1F7F2),
        onSurfaceVariant = Color(0xFFC2D3D1),
        outline = Color(0xFF5A7575)
    ) else lightColorScheme(
        primary = accent,
        onPrimary = Color.White,
        primaryContainer = Color(0xFFD9F2E9),
        onPrimaryContainer = AcademyInk,
        background = if (style == "classic") Color(0xFFFFFFFF) else AcademyPaper,
        surface = if (style == "liquid") Color(0xFFFCFFFA) else Color(0xFFFFFEFB),
        surfaceContainerHigh = Color(0xFFF0F5F1),
        onSurface = AcademyInk,
        onSurfaceVariant = Color(0xFF617471),
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
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.98f),
        shadowElevation = 2.dp,
        border = BorderStroke(0.5.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.65f))
    ) {
        Row(
            Modifier.fillMaxWidth()
                .windowInsetsPadding(WindowInsets.statusBars)
                .height(69.dp)
                .padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(Modifier.weight(1f).clickable(onClick = onHome), verticalAlignment = Alignment.CenterVertically) {
                AcademyLogo()
                Spacer(Modifier.width(9.dp))
                Text("Shtemarm", fontWeight = FontWeight.Black, fontSize = 19.sp,
                    color = MaterialTheme.colorScheme.onSurface)
                Spacer(Modifier.width(6.dp))
                Box(
                    Modifier.clip(RoundedCornerShape(6.dp))
                        .background(AcademyGold.copy(alpha = 0.18f))
                        .border(1.dp, AcademyGold.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 5.dp, vertical = 3.dp)
                ) {
                    Text("BETA", color = Color(0xFF9C6D20), fontWeight = FontWeight.Black, fontSize = 9.sp)
                }
            }
            TextButton(onClick = onProgress) {
                Icon(Icons.Default.Star, null, tint = Color(0xFFC39A39), modifier = Modifier.size(17.dp))
                Spacer(Modifier.width(3.dp))
                Text(points.toString(), color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold)
            }
            Box {
                IconButton(
                    onClick = { menuOpen = true },
                    modifier = Modifier.clip(RoundedCornerShape(13.dp))
                        .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                ) {
                    Icon(Icons.Default.Menu, contentDescription = "Բացել ընտրացանկը")
                }
                DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                    DropdownMenuItem(
                        text = { Text("Գլխավոր") },
                        leadingIcon = { Icon(Icons.Default.Home, null) },
                        onClick = { menuOpen = false; onHome() }
                    )
                    DropdownMenuItem(
                        text = { Text("Իմ առաջընթացը") },
                        leadingIcon = { Icon(Icons.Default.Star, null) },
                        onClick = { menuOpen = false; onProgress() }
                    )
                    DropdownMenuItem(
                        text = { Text("Պահպանված հարցեր") },
                        leadingIcon = { Icon(Icons.Default.Book, null) },
                        onClick = { menuOpen = false; onSaved() }
                    )
                    DropdownMenuItem(
                        text = { Text("Կարգավորումներ") },
                        leadingIcon = { Icon(Icons.Default.Settings, null) },
                        onClick = { menuOpen = false; onSettings() }
                    )
                }
            }
        }
    }
}

@Composable
fun AcademyFloatingDock(selected: Int, onSelect: (Int) -> Unit) {
    val liquid = LocalAcademySurface.current == "liquid"
    val tabs = listOf(
        Triple("Գլխավոր", Icons.Default.Home, 0),
        Triple("Գրքեր", Icons.Default.Book, 1),
        Triple("Թեստեր", Icons.Default.CheckCircle, 2),
        Triple("Խաղեր", Icons.Default.SportsEsports, 3),
        Triple("Գործիքներ", Icons.Default.Build, 4)
    )
    Box(
        Modifier.fillMaxWidth().windowInsetsPadding(WindowInsets.navigationBars)
            .padding(start = 12.dp, end = 12.dp, bottom = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = MaterialTheme.colorScheme.surface.copy(alpha = if (liquid) 0.88f else 1f),
            shadowElevation = if (liquid) 14.dp else 4.dp,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.58f))
        ) {
            Row(Modifier.fillMaxWidth().padding(6.dp)) {
                tabs.forEach { (label, icon, id) ->
                    val active = selected == id
                    val shape = RoundedCornerShape(21.dp)
                    Column(
                        modifier = Modifier.weight(1f)
                            .clip(shape)
                            .background(
                                if (active) MaterialTheme.colorScheme.primary.copy(alpha = 0.14f)
                                else Color.Transparent
                            )
                            .clickable { onSelect(id) }
                            .height(60.dp)
                            .padding(top = 7.dp, bottom = 5.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Icon(icon, contentDescription = label,
                            tint = if (active) MaterialTheme.colorScheme.primary
                                   else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(23.dp))
                        Text(label, maxLines = 1, fontSize = 10.sp,
                            fontWeight = if (active) FontWeight.ExtraBold else FontWeight.Medium,
                            color = if (active) MaterialTheme.colorScheme.primary
                                    else MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
fun AcademyHero(onSubjects: () -> Unit, onExams: () -> Unit) {
    Box(
        Modifier.fillMaxWidth()
            .clip(RoundedCornerShape(27.dp))
            .background(Brush.linearGradient(listOf(
                Color(0xFF103D44), Color(0xFF0E5A58), Color(0xFF147C70)
            )))
    ) {
        Column(Modifier.padding(23.dp), verticalArrangement = Arrangement.spacedBy(17.dp)) {
            Row(
                Modifier.clip(RoundedCornerShape(24.dp))
                    .background(Color.White.copy(alpha = 0.11f))
                    .border(1.dp, Color.White.copy(alpha = 0.22f), RoundedCornerShape(24.dp))
                    .padding(horizontal = 12.dp, vertical = 7.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.School, null, tint = Color(0xFFD9F9E9),
                    modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("SHTEMARM · ACADEMY", fontWeight = FontWeight.Bold,
                    fontSize = 10.sp, letterSpacing = 1.1.sp, color = Color(0xFFD9F9E9))
            }
            Text(
                "Սովորիր վստահ։\nՊատրաստվիր խելացի։",
                fontWeight = FontWeight.Black, fontSize = 29.sp,
                lineHeight = 39.sp, color = Color.White
            )
            Text(
                "Շտեմարաններ, թեմատիկ վարժություններ և փորձնական քննություններ՝ մեկ հարմար ուսումնական տարածքում։",
                color = Color(0xFFDCEFEA), fontSize = 14.sp, lineHeight = 23.sp
            )
            Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                Button(
                    onClick = onSubjects, modifier = Modifier.fillMaxWidth().heightIn(min = 47.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = Color(0xFF124E4B)
                    ),
                    shape = RoundedCornerShape(13.dp)
                ) {
                    Icon(Icons.Default.Book, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Ընտրել առարկան", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.width(6.dp))
                    Icon(Icons.Default.ArrowForward, null, modifier = Modifier.size(17.dp))
                }
                OutlinedButton(
                    onClick = onExams, modifier = Modifier.fillMaxWidth().heightIn(min = 47.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.27f)),
                    shape = RoundedCornerShape(13.dp)
                ) {
                    Icon(Icons.Default.CheckCircle, null, modifier = Modifier.size(17.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Անցնել թեստ", fontWeight = FontWeight.Bold)
                }
            }
            Column(
                Modifier.fillMaxWidth()
                    .clip(RoundedCornerShape(19.dp))
                    .background(Color.White.copy(alpha = 0.10f))
                    .border(1.dp, Color.White.copy(alpha = 0.13f), RoundedCornerShape(19.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(13.dp)
            ) {
                Text("ՈՒՍՈՒՄՆԱԿԱՆ ՔԱՅԼԵՐ", color = Color(0xFFCAEBE3),
                    fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.4.sp)
                listOf(
                    "01" to ("Ընտրիր առարկան" to "Գտիր քո շտեմարանը"),
                    "02" to ("Սովորիր թեմաներով" to "Բացատրություններ ու վարժություններ"),
                    "03" to ("Ստուգիր գիտելիքներդ" to "Փորձնական քննություններ")
                ).forEach { (number, text) ->
                    Row(verticalAlignment = Alignment.Top) {
                        Text(number, color = Color(0xFFF1D08C), fontWeight = FontWeight.Bold,
                            fontSize = 14.sp, modifier = Modifier.width(36.dp))
                        Column {
                            Text(text.first, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(text.second, color = Color(0xFFC9DFD9), fontSize = 12.sp)
                        }
                    }
                }
            }
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
    Surface(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(19.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = .7f)),
        shadowElevation = 1.dp
    ) {
        Row(
            Modifier.fillMaxWidth().heightIn(min = 69.dp).padding(horizontal = 14.dp, vertical = 11.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(Modifier.size(45.dp).clip(RoundedCornerShape(13.dp))
                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center) {
                Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(23.dp))
            }
            Spacer(Modifier.width(13.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Black, fontSize = 15.sp)
                Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            Icon(Icons.Default.ArrowForward, null, tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(18.dp))
        }
    }
}

@Composable
fun AcademySectionTitle(title: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.width(5.dp).height(27.dp).clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.primary))
        Spacer(Modifier.width(11.dp))
        Text(title, fontWeight = FontWeight.Black, fontSize = 23.sp,
            lineHeight = 31.sp, color = MaterialTheme.colorScheme.onSurface)
    }
}

@Composable
fun AcademyEyebrow(label: String) {
    Text(label.uppercase(), color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.ExtraBold, letterSpacing = 1.1.sp, fontSize = 11.sp)
}

@Composable
fun AcademyStatCard(label: String, value: String, caption: String, icon: ImageVector) {
    Surface(
        shape = RoundedCornerShape(22.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = .7f)),
        shadowElevation = 2.dp
    ) {
        Column(Modifier.fillMaxWidth().padding(17.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(17.dp))
                Spacer(Modifier.width(7.dp))
                Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
            }
            Text(value, fontWeight = FontWeight.Black, fontSize = 26.sp)
            Text(caption, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
    }
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
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(23.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = .72f)),
        shadowElevation = 2.dp
    ) {
        Column {
            Row(
                Modifier.fillMaxWidth().clickable { expanded = !expanded }
                    .padding(horizontal = 15.dp, vertical = 18.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(Modifier.size(38.dp).clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.09f)),
                    contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Book, null, tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(21.dp))
                }
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(subject, fontWeight = FontWeight.Black, fontSize = 17.sp)
                    Text(books.size.toString() + " հավաքածու",
                        color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                }
                Text(if (expanded) "⌃" else "⌄", fontSize = 23.sp,
                    color = MaterialTheme.colorScheme.primary)
            }
            if (expanded) {
                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = .65f))
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    books.forEach { book ->
                        AcademyBookTile(book) { onOpenBook(book) }
                    }
                    TextButton(onClick = onOpenSubject, modifier = Modifier.fillMaxWidth()) {
                        Text("Տեսնել " + subject + " առարկայի գրքերը")
                        Spacer(Modifier.width(6.dp))
                        Icon(Icons.Default.ArrowForward, null, modifier = Modifier.size(17.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun AcademyBookTile(book: StudyBook, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = .62f))
    ) {
        Row(Modifier.fillMaxWidth().padding(11.dp), verticalAlignment = Alignment.CenterVertically) {
            AcademyMiniCover(book.subject, book.title)
            Spacer(Modifier.width(13.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Text(book.title, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
                Text(book.subject, fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("Բացել շտեմարանը →", fontWeight = FontWeight.Bold, fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
fun AcademyMiniCover(subject: String, title: String) {
    val colors = when (subject) {
        "Մաթեմատիկա" -> listOf(Color(0xFF071A52), Color(0xFF2459D9), Color(0xFF55D9E8))
        "Անգլերեն" -> listOf(Color(0xFF14265F), Color(0xFF3869E8), Color(0xFF7DD3FC))
        "Կենսաբանություն" -> listOf(Color(0xFF073A35), Color(0xFF10785A), Color(0xFF28A16A))
        "Հայոց պատմություն" -> listOf(Color(0xFF7F1D1D), Color(0xFFC2410C), Color(0xFFFBBF24))
        "Հայոց լեզու" -> listOf(Color(0xFF1B263A), Color(0xFF303B78), Color(0xFF505EB1))
        "Ֆիզիկա" -> listOf(Color(0xFF071F36), Color(0xFF136E9C), Color(0xFF27BBCE))
        else -> listOf(Color(0xFF153039), Color(0xFF147C70))
    }
    Column(
        Modifier.width(81.dp).height(111.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Brush.linearGradient(colors))
            .padding(9.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text("SHTEMARM", fontSize = 8.sp, fontWeight = FontWeight.ExtraBold,
            color = Color(0xFFE4F7F0), letterSpacing = .3.sp)
        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Icon(Icons.Default.School, null, tint = Color.White, modifier = Modifier.size(23.dp))
            Text(subject, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Black,
                maxLines = 3, lineHeight = 12.sp)
        }
        Box(Modifier.fillMaxWidth().height(3.dp).clip(RoundedCornerShape(3.dp))
            .background(Color.White.copy(alpha = .55f)))
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
    largeText: Boolean,
    onLargeText: (Boolean) -> Unit,
    immediateFeedback: Boolean,
    onFeedback: (Boolean) -> Unit
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
        item {
            Text("Կայքի ոճը", fontWeight = FontWeight.Bold, fontSize = 17.sp)
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("classic" to "Դասական", "soft" to "Ակադեմիական", "liquid" to "Liquid Glass")
                    .forEach { (value, label) ->
                        FilterChip(selected = surface == value, onClick = { onSurface(value) },
                            label = { Text(label) })
                    }
            }
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
            Spacer(Modifier.height(10.dp))
        }
    }
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
    onPlay: () -> Unit,
    onClassic: () -> Unit,
    onTest: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(21.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = .65f)),
        shadowElevation = 2.dp
    ) {
        Column(Modifier.fillMaxWidth().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier.size(44.dp).clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(index.toString(), color = MaterialTheme.colorScheme.onPrimary,
                        fontWeight = FontWeight.Black, fontSize = 20.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text(count.toString() + " հասանելի հարց",
                        color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                Button(
                    onClick = onPlay,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 3.dp, vertical = 10.dp),
                    shape = RoundedCornerShape(12.dp)
                ) { Text("Խաղալ", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                OutlinedButton(
                    onClick = onClassic,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 3.dp, vertical = 10.dp),
                    shape = RoundedCornerShape(12.dp)
                ) { Text("Դասական", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                FilledTonalButton(
                    onClick = onTest,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 3.dp, vertical = 10.dp),
                    shape = RoundedCornerShape(12.dp)
                ) { Text("Թեստ", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
            }
        }
    }
}
