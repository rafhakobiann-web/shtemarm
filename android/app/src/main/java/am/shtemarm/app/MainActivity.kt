package am.shtemarm.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val BrandTeal = Color(0xFF0B766B)
private enum class Page { HOME, SUBJECTS, BOOKS, SECTIONS, STUDY, RESULT, PROGRESS, SETTINGS, EXAMS, GAMES, TOOLS, MATH, ADVANCED, SAVED }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { NativeShtemarm() }
    }
}

/** Android-native UI. No WebView, Javascript or embedded website is used. */
@Composable
private fun NativeShtemarm() {
    val context = LocalContext.current.applicationContext
    val repository = remember { QuestionRepository(context) }
    val progress = remember { StudyProgress(context) }
    var dark by remember { mutableStateOf(progress.darkMode) }
    var largeText by remember { mutableStateOf(progress.largeText) }
    var immediateFeedback by remember { mutableStateOf(progress.showAnswersImmediately) }
    var accent by remember { mutableStateOf(progress.accent) }
    var surfaceStyle by remember { mutableStateOf(progress.surfaceStyle) }
    var glassIntensity by remember { mutableStateOf(progress.glassIntensity) }
    var progressVersion by remember { mutableIntStateOf(0) }

    var page by remember { mutableStateOf(Page.HOME) }
    var sessionOrigin by remember { mutableStateOf(Page.SECTIONS) }
    var subject by remember { mutableStateOf(BookCatalog.subjects.first()) }
    var book by remember { mutableStateOf<StudyBook?>(null) }
    var loaded by remember { mutableStateOf<LoadedBook?>(null) }
    var loading by remember { mutableStateOf(false) }
    var loadError by remember { mutableStateOf("") }

    var session by remember { mutableStateOf<List<StudyQuestion>>(emptyList()) }
    var sessionTitle by remember { mutableStateOf("") }
    var sessionIndex by remember { mutableIntStateOf(0) }
    var chosen by remember { mutableIntStateOf(-1) }
    var score by remember { mutableIntStateOf(0) }
    var correctIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    var savedQuestions by remember { mutableStateOf<List<StudyQuestion>>(emptyList()) }
    var savedLoading by remember { mutableStateOf(false) }

    fun back() {
        page = when(page) {
            Page.STUDY -> sessionOrigin
            Page.RESULT -> sessionOrigin
            Page.SECTIONS -> Page.BOOKS
            Page.MATH -> Page.BOOKS
            Page.ADVANCED -> Page.SECTIONS
            Page.BOOKS -> Page.SUBJECTS
            else -> Page.HOME
        }
    }

    fun begin(pool: List<StudyQuestion>, count: Int, name: String, shuffle: Boolean = true) {
        if (pool.isEmpty()) return
        if (page != Page.RESULT) sessionOrigin = page
        session = (if (shuffle) pool.shuffled() else pool).take(count.coerceAtLeast(1))
        sessionTitle = name
        sessionIndex = 0
        chosen = -1
        score = 0
        correctIds = emptySet()
        page = Page.STUDY
    }

    LaunchedEffect(book) {
        val chosenBook = book ?: return@LaunchedEffect
        loading = true
        loadError = ""
        loaded = null
        try {
            loaded = repository.load(chosenBook)
        } catch (e: Exception) {
            loadError = "Հնարավոր չեղավ բացել շտեմարանը։ " + (e.localizedMessage ?: "")
        }
        loading = false
    }

    LaunchedEffect(page, progressVersion) {
        if (page == Page.SAVED) {
            savedLoading = true
            val ids = progress.bookmarkedIds()
            val collected = mutableListOf<StudyQuestion>()
            if (ids.isNotEmpty()) {
                for (entry in BookCatalog.books.filter { it.subject != "Մաթեմատիկա" }) {
                    try { collected += repository.load(entry).allQuestions.filter { it.id in ids } }
                    catch (_: Exception) { /* Other books remain available. */ }
                }
            }
            savedQuestions = collected.distinctBy { it.id }
            savedLoading = false
        }
    }

    BackHandler(page != Page.HOME) { back() }

    val colors = academyColors(dark, academyAccent(accent), surfaceStyle)
    val originalDensity = LocalDensity.current
    MaterialTheme(colorScheme = colors, typography = ShtemarmTypography) {
        CompositionLocalProvider(
            LocalDensity provides Density(
                originalDensity.density, originalDensity.fontScale * if (largeText) 1.22f else 1f
            ),
            LocalAcademySurface provides surfaceStyle,
            LocalGlassIntensity provides glassIntensity
        ) {
            AcademyAmbientBackdrop(Modifier.fillMaxSize()) {
            Scaffold(
                containerColor = Color.Transparent,
                topBar = {
                    AcademyTopBar(
                        points = BookCatalog.subjects.sumOf { progress.stats(it).correct } * 10,
                        onHome = { page = Page.HOME },
                        onProgress = { page = Page.PROGRESS },
                        onSaved = { page = Page.SAVED },
                        onSettings = { page = Page.SETTINGS }
                    )
                },
                bottomBar = {
                    AcademyFloatingDock(
                        selected = when (page) {
                            Page.HOME, Page.PROGRESS, Page.SETTINGS, Page.SAVED -> 0
                            Page.SUBJECTS, Page.BOOKS, Page.SECTIONS, Page.MATH, Page.ADVANCED -> 1
                            Page.EXAMS -> 2
                            Page.GAMES -> 3
                            Page.TOOLS -> 4
                            Page.STUDY, Page.RESULT -> when (sessionOrigin) {
                                Page.EXAMS -> 2
                                Page.GAMES -> 3
                                Page.TOOLS -> 4
                                else -> 1
                            }
                        },
                        onSelect = { tab ->
                            page = when (tab) {
                                0 -> Page.HOME
                                1 -> Page.SUBJECTS
                                2 -> Page.EXAMS
                                3 -> Page.GAMES
                                else -> Page.TOOLS
                            }
                        }
                    )
                }
            ) { padding ->
                when (page) {
                    Page.ADVANCED -> {
                        val activeBook = book
                        if (activeBook != null) Box(Modifier.fillMaxSize().padding(padding)) { NativeAdvancedPractice(activeBook) { page = Page.SECTIONS } }
                    }
                    Page.MATH -> Box(Modifier.fillMaxSize().padding(padding)) { NativeMath(if (book?.title?.contains("Մաս 2") == true) 2 else 1) }
                    Page.EXAMS -> Box(Modifier.fillMaxSize().padding(padding)) { NativeExams(repository) { selectedSubject, pool, count, name ->
                        subject = selectedSubject
                        begin(pool, count, name)
                    } }
                    Page.GAMES -> Box(Modifier.fillMaxSize().padding(padding)) { NativeGames(repository) { selectedSubject, pool, count, name ->
                        subject = selectedSubject
                        begin(pool, count, name)
                    } }
                    Page.TOOLS -> Box(Modifier.fillMaxSize().padding(padding)) { NativeTools(repository) { selectedSubject, pool, count, name ->
                        subject = selectedSubject
                        begin(pool, count, name)
                    } }
                    Page.HOME -> {
                        val stats = BookCatalog.subjects.map { progress.stats(it) }
                        val correct = stats.sumOf { it.correct }
                        val answered = stats.sumOf { it.answered }
                        LazyColumn(
                            Modifier.fillMaxSize().padding(padding).padding(horizontal = 15.dp),
                            verticalArrangement = Arrangement.spacedBy(17.dp)
                        ) {
                            item { Spacer(Modifier.height(3.dp)) }
                            item { AcademyHero(onSubjects = { page = Page.SUBJECTS }, onExams = { page = Page.EXAMS }) }
                            item {
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    AcademyQuickAction(Icons.Default.Book, "Շտեմարաններ", "Ընտրիր գիրքը") {
                                        page = Page.SUBJECTS
                                    }
                                    AcademyQuickAction(Icons.Default.Star, "Թեմատիկ աշխատանք", "Ստեղծիր առաջադրանքներ") {
                                        page = Page.TOOLS
                                    }
                                    AcademyQuickAction(Icons.Default.Settings, "Ուսումնական գործիքներ", "Կենտրոնացում և կրկնություն") {
                                        page = Page.TOOLS
                                    }
                                }
                            }
                            item {
                                Text("Քո ուսումնական առաջընթացը", fontSize = 23.sp, fontWeight = FontWeight.Black)
                            }
                            item {
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    AcademyStatCard("Քո միավորները", (correct * 10).toString() + " XP",
                                        "Այս սարքի վարժանքներից", Icons.Default.Star)
                                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                        Box(Modifier.weight(1f)) {
                                            AcademyStatCard("Ճիշտ պատասխաններ", correct.toString(),
                                                "Պատասխանված՝ " + answered, Icons.Default.Book)
                                        }
                                        Box(Modifier.weight(1f)) {
                                            AcademyStatCard("Կրկնելու հարցեր", (answered - correct).toString(),
                                                "Ավարտված վարժանքներից", Icons.Default.Settings)
                                        }
                                    }
                                }
                            }
                            item {
                                OutlinedButton(
                                    modifier = Modifier.fillMaxWidth(),
                                    onClick = { page = Page.PROGRESS },
                                    shape = RoundedCornerShape(16.dp)
                                ) { Text("Մանրամասն առաջընթաց") }
                            }
                            item {
                                AcademyEyebrow("Ուսումնական գրադարան")
                                Spacer(Modifier.height(9.dp))
                                AcademySectionTitle("Գտիր քո շտեմարանը")
                                Spacer(Modifier.height(5.dp))
                                Text("Բացիր առարկան՝ տեսնելու բոլոր գրքերն ու հարցաշարերը։",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                            }
                            items(BookCatalog.subjects) { s ->
                                AcademySubjectAccordion(
                                    subject = s,
                                    books = BookCatalog.books.filter { it.subject == s },
                                    initiallyExpanded = s == "Անգլերեն" || s == "Մաթեմատիկա",
                                    onOpenSubject = { subject = s; page = Page.BOOKS },
                                    onOpenBook = { item ->
                                        subject = s
                                        book = item
                                        page = if (s == "Մաթեմատիկա") Page.MATH else Page.SECTIONS
                                    }
                                )
                            }
                            item {
                                AcademyEyebrow("Գիտելիքների ստուգում")
                                Spacer(Modifier.height(8.dp))
                                AcademySectionTitle("Փորձնական քննություններ")
                                Spacer(Modifier.height(7.dp))
                                Text("Ընտրիր առարկան և ստուգիր պատրաստվածությունդ։",
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            item {
                                AcademyQuickAction(Icons.Default.Star, "Փորձնական քննություններ",
                                    "Ստուգիր գիտելիքներդ") { page = Page.EXAMS }
                            }
                            item {
                                AcademyQuickAction(Icons.Default.Book, "Մինի խաղեր և բառապաշար",
                                    "Սովորիր խաղալով") { page = Page.GAMES }
                            }
                            item {
                                AcademyQuickAction(Icons.Default.Settings, "Ուսումնական գործիքներ",
                                    "Հաշվիչ, բառապաշար, թեմատիկ աշխատանք") { page = Page.TOOLS }
                            }
                            item {
                                OutlinedButton(
                                    onClick = { page = Page.SAVED },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(15.dp)
                                ) { Text("☆ Պահպանված հարցեր · " + progress.bookmarkedIds().size) }
                                Spacer(Modifier.height(12.dp))
                            }
                        }
                    }
                    Page.SUBJECTS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(horizontal = 15.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item { Spacer(Modifier.height(7.dp)) }
                        item {
                            AcademyEyebrow("Ուսումնական գրադարան")
                            Spacer(Modifier.height(10.dp))
                            AcademySectionTitle("Գտիր քո շտեմարանը")
                            Spacer(Modifier.height(7.dp))
                            Text("Բացիր առարկան՝ տեսնելու բոլոր գրքերն ու հարցաշարերը։",
                                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                        }
                        items(BookCatalog.subjects) { s ->
                            AcademySubjectAccordion(
                                subject = s,
                                books = BookCatalog.books.filter { it.subject == s },
                                initiallyExpanded = s == "Անգլերեն" || s == "Մաթեմատիկա",
                                onOpenSubject = { subject = s; page = Page.BOOKS },
                                onOpenBook = { item ->
                                    subject = s
                                    book = item
                                    page = if (s == "Մաթեմատիկա") Page.MATH else Page.SECTIONS
                                }
                            )
                        }
                        item {
                            Text("Մաթեմատիկայի մի շարք առաջադրանքների պատասխանները դեռ հաստատված չեն։ Կենսաբանության 3-րդ և 4-րդ գրքերի ամբողջական ստուգված բանկերն առկա չեն։",
                                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                            Spacer(Modifier.height(10.dp))
                        }
                    }
                    Page.BOOKS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(horizontal = 15.dp),
                        verticalArrangement = Arrangement.spacedBy(11.dp)
                    ) {
                        item {
                            Spacer(Modifier.height(7.dp))
                            AcademyEyebrow("Ուսումնական գրադարան")
                            Spacer(Modifier.height(10.dp))
                            AcademySectionTitle(subject)
                            Spacer(Modifier.height(7.dp))
                            Text("Ընտրիր շտեմարան կամ թեստերի հավաքածու։",
                                fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        items(BookCatalog.books.filter { it.subject == subject }) { item ->
                            AcademyBookTile(item) {
                                book = item
                                page = if (item.subject == "Մաթեմատիկա") Page.MATH else Page.SECTIONS
                            }
                        }
                        item { Spacer(Modifier.height(12.dp)) }
                    }
                    Page.SECTIONS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(11.dp)
                    ) {
                        item { ScreenHeading(book?.title ?: "Շտեմարան", subject) }
                        if (book?.asset in listOf(
                            "book1.json", "book2.json", "book3.json",
                            "bio-book1.json", "history-book1.json", "history-book2.json",
                            "history-book3.json", "physics-book1.json", "physics-book2.json"
                        )) item {
                            OutlinedButton(
                                onClick = { page = Page.ADVANCED },
                                modifier = Modifier.fillMaxWidth()
                            ) { Text("Բազմաքայլ առաջադրանքներ · համապատասխանեցում, թվային, հերթականություն") }
                        }
                        if (loading) item {
                            LinearProgressIndicator(Modifier.fillMaxWidth())
                            Text("Բացվում է…")
                        } else if (loadError.isNotBlank()) item {
                            Text(loadError, color = MaterialTheme.colorScheme.error)
                        } else {
                            val data = loaded
                            if (data == null || data.allQuestions.isEmpty()) item {
                                Text("Այս գրքում առայժմ ստուգված բազմընտրանի հարցեր հասանելի չեն։")
                            } else {
                                val pool = data.allQuestions
                                item {
                                    Text("Հասանելի հարցեր՝ " + pool.size, fontWeight = FontWeight.SemiBold)
                                    Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                                        Button(onClick = { begin(pool, 10, "Արագ վարժանք") },
                                            modifier = Modifier.weight(1f)) { Text("10 հարց") }
                                        OutlinedButton(onClick = { begin(pool, 30, "Պատահական թեստ") },
                                            modifier = Modifier.weight(1f)) { Text("30 հարց") }
                                    }
                                    OutlinedButton(
                                        onClick = { begin(pool, pool.size, "Ամբողջ շտեմարան") },
                                        modifier = Modifier.fillMaxWidth()
                                    ) { Text("Բոլոր հասանելի հարցերը") }
                                    Text("Սրանք ուսումնական թեստեր են․ դրանք չեն կրկնում ԳԹԿ պաշտոնական քննության ամբողջ կառուցվածքը։",
                                        color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                                }
                                item { Text("Բաժիններ", fontWeight = FontWeight.Bold, fontSize = 21.sp) }
                                items(data.sections.size) { sectionIndex ->
                                    val sec = data.sections[sectionIndex]
                                    AcademyBookSectionCard(
                                        index = sectionIndex + 1,
                                        title = sec.title,
                                        count = sec.questions.size,
                                        onPlay = {
                                            begin(sec.questions, minOf(10, sec.questions.size), sec.title + " · Խաղ")
                                        },
                                        onClassic = {
                                            begin(sec.questions, sec.questions.size, sec.title, shuffle = false)
                                        },
                                        onTest = {
                                            begin(sec.questions, minOf(30, sec.questions.size), sec.title + " · Թեստ")
                                        }
                                    )
                                }
                            }
                        }
                    }
                    Page.STUDY -> {
                        if (sessionIndex < session.size) {
                            val q = session[sessionIndex]
                            LazyColumn(
                                Modifier.fillMaxSize().padding(padding).padding(horizontal = 16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                item {
                                    Spacer(Modifier.height(8.dp))
                                    Text(sessionTitle, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                                    Spacer(Modifier.height(6.dp))
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text("Հարց " + (sessionIndex + 1) + " / " + session.size,
                                            color = MaterialTheme.colorScheme.primary)
                                        Spacer(Modifier.weight(1f))
                                        Text("Ճիշտ՝ " + score)
                                    }
                                    LinearProgressIndicator(
                                        progress = { (sessionIndex + 1).toFloat() / session.size },
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }
                                if (q.passage.isNotBlank()) item {
                                    ElevatedCard(shape = RoundedCornerShape(15.dp)) {
                                        Column(Modifier.padding(16.dp)) {
                                            Text("Տեքստ", fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.primary)
                                            Spacer(Modifier.height(10.dp))
                                            Text(q.passage, fontFamily = StudyReadingFont, fontSize = 15.sp, lineHeight = 28.sp)
                                        }
                                    }
                                }
                                item {
                                    Text(q.stem, fontSize = 19.sp, lineHeight = 28.sp,
                                        fontWeight = FontWeight.SemiBold)
                                    Spacer(Modifier.height(8.dp))
                                    val saved = progressVersion.let { progress.isBookmarked(q.id) }
                                    TextButton(onClick = { progress.toggleBookmark(q.id); progressVersion++ }) {
                                        Text(if (saved) "★ Հեռացնել պահպանվածներից" else "☆ Պահպանել հարցը")
                                    }
                                }
                                items(q.choices.size) { n ->
                                    val correct = chosen >= 0 && immediateFeedback && n == q.correctIndex
                                    val wrong = chosen == n && n != q.correctIndex && immediateFeedback
                                    val bg = when {
                                        correct -> Color(0xFFD1FAE5)
                                        wrong -> Color(0xFFFEE2E2)
                                        else -> MaterialTheme.colorScheme.surfaceContainerHigh
                                    }
                                    Card(
                                        modifier = Modifier.fillMaxWidth()
                                            .clickable(enabled = chosen < 0) {
                                                chosen = n
                                                if (n == q.correctIndex) {
                                                    score++
                                                    correctIds = correctIds + q.id
                                                }
                                            },
                                        colors = CardDefaults.cardColors(containerColor = bg),
                                        shape = RoundedCornerShape(14.dp)
                                    ) {
                                        Row(Modifier.fillMaxWidth().padding(16.dp),
                                            verticalAlignment = Alignment.CenterVertically) {
                                            Text(("ABCD".getOrNull(n) ?: '•').toString() + ".",
                                                fontWeight = FontWeight.Bold, modifier = Modifier.width(30.dp))
                                            Text(q.choices[n], fontSize = 16.sp)
                                        }
                                    }
                                }
                                if (chosen >= 0) item {
                                    if (immediateFeedback) {
                                        Text(if (chosen == q.correctIndex) "Ճիշտ է ✓" else "Սխալ պատասխան",
                                            fontWeight = FontWeight.Bold)
                                        if (q.explanation.isNotBlank()) Text(q.explanation)
                                    }
                                    Button(
                                        onClick = {
                                            if (sessionIndex + 1 >= session.size) {
                                                progress.saveSession(subject, score, session.size)
                                                progressVersion++
                                                page = Page.RESULT
                                            } else {
                                                sessionIndex++
                                                chosen = -1
                                            }
                                        },
                                        modifier = Modifier.fillMaxWidth()
                                    ) { Text(if (sessionIndex + 1 == session.size) "Տեսնել արդյունքը" else "Հաջորդ հարցը") }
                                    Spacer(Modifier.height(20.dp))
                                }
                            }
                        }
                    }
                    Page.RESULT -> Column(
                        Modifier.fillMaxSize().padding(padding).padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text("Վարժանքն ավարտվեց", fontSize = 26.sp, fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center)
                        Spacer(Modifier.height(24.dp))
                        Text(score.toString() + " / " + session.size,
                            fontSize = 40.sp, fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary)
                        Text("Ճիշտ պատասխան", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        if (sessionTitle == "Անգլերենի մակարդակի ստուգում") {
                            var estimate = "A1 կամ ցածր"
                            for (tier in listOf("a1", "a2", "b1", "b2", "c1")) {
                                val tierItems = session.filter { it.id.lowercase().startsWith(tier + "-") }
                                val rate = if (tierItems.isEmpty()) 0.0 else
                                    tierItems.count { it.id in correctIds }.toDouble() / tierItems.size
                                if (rate < 0.6) break
                                estimate = tier.uppercase()
                            }
                            Spacer(Modifier.height(12.dp))
                            Text("Մոտավոր CEFR մակարդակ՝ " + estimate,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold)
                            Text("Սա մոտավոր գնահատական է և չի համարվում լեզվի իմացության պաշտոնական հավաստագիր։",
                                fontSize = 12.sp, textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Spacer(Modifier.height(26.dp))
                        Button(onClick = { begin(session, session.size, sessionTitle) },
                            modifier = Modifier.fillMaxWidth()) { Text("Կրկնել վարժանքը") }
                        val missed = session.filter { it.id !in correctIds }
                        if (missed.isNotEmpty()) {
                            OutlinedButton(
                                onClick = { begin(missed, missed.size, "Սխալների կրկնություն") },
                                modifier = Modifier.fillMaxWidth()
                            ) { Text("Կրկնել սխալ պատասխանները · " + missed.size) }
                        }
                        OutlinedButton(onClick = { page = Page.PROGRESS },
                            modifier = Modifier.fillMaxWidth()) { Text("Իմ առաջընթացը") }
                        TextButton(onClick = { page = sessionOrigin }) { Text("Վերադառնալ") }
                    }
                    Page.SAVED -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item { ScreenHeading("Պահպանված հարցերը", "Կրկնիր նշված հարցերը՝ առանց ինտերնետի։") }
                        if (savedLoading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
                        else if (savedQuestions.isEmpty()) item {
                            Text("Դու դեռ հարցեր չես պահպանել։ Վարժանքի ընթացքում սեղմիր «Պահպանել հարցը» կոճակը։")
                        } else {
                            item {
                                Text("Պահպանված՝ " + savedQuestions.size, fontWeight = FontWeight.Bold)
                                Button(
                                    modifier = Modifier.fillMaxWidth(),
                                    onClick = {
                                        // Questions may belong to several subjects: progress is grouped under review.
                                        subject = "Կրկնություն"
                                        begin(savedQuestions, savedQuestions.size, "Պահպանված հարցերի կրկնություն")
                                    }
                                ) { Text("Սկսել կրկնությունը") }
                            }
                            items(savedQuestions) { q ->
                                ElevatedCard(Modifier.fillMaxWidth()) {
                                    Column(Modifier.padding(16.dp)) {
                                        Text(q.stem, maxLines = 3)
                                        TextButton(onClick = {
                                            progress.toggleBookmark(q.id)
                                            progressVersion++
                                        }) { Text("Հեռացնել ☆") }
                                    }
                                }
                            }
                        }
                    }
                    Page.PROGRESS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        item { ScreenHeading("Իմ առաջընթացը", "Արդյունքները պահվում են այս սարքում։") }
                        items(BookCatalog.subjects) { s ->
                            val stats = progress.stats(s)
                            ElevatedCard(Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp)) {
                                Column(Modifier.padding(18.dp)) {
                                    Text(s, fontWeight = FontWeight.Bold)
                                    Spacer(Modifier.height(6.dp))
                                    Text("Վարժանքներ՝ " + stats.sessions +
                                        " · Ճիշտ՝ " + stats.correct + " / " + stats.answered)
                                    if (stats.answered > 0) {
                                        Spacer(Modifier.height(8.dp))
                                        LinearProgressIndicator(
                                            progress = { stats.accuracy / 100f },
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                        Text("Ճիշտ պատասխանների տոկոսը՝ " + stats.accuracy + "%", fontSize = 13.sp)
                                    }
                                }
                            }
                        }
                    }
                    Page.SETTINGS -> Box(Modifier.fillMaxSize().padding(padding)) {
                        AcademyAppearanceSettings(
                            dark = dark,
                            onDark = { dark = it; progress.darkMode = it },
                            accent = accent,
                            onAccent = { accent = it; progress.accent = it },
                            surface = surfaceStyle,
                            onSurface = { surfaceStyle = it; progress.surfaceStyle = it },
                            glassIntensity = glassIntensity,
                            onGlassIntensity = {
                                glassIntensity = it
                                progress.glassIntensity = it
                            },
                            largeText = largeText,
                            onLargeText = { largeText = it; progress.largeText = it },
                            immediateFeedback = immediateFeedback,
                            onFeedback = {
                                immediateFeedback = it
                                progress.showAnswersImmediately = it
                            }
                        )
                    }
                }
            }
            }
        }
    }
}

@Composable private fun ScreenHeading(title: String, subtitle: String) {
    Text(title, fontSize = 25.sp, fontWeight = FontWeight.Bold)
    Spacer(Modifier.height(6.dp))
    Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Spacer(Modifier.height(8.dp))
}

@Composable private fun SubjectCard(subject: String, onClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(Modifier.fillMaxWidth().padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(subject, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                Text(BookCatalog.books.count { it.subject == subject }.toString() + " հավաքածու",
                    fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text("›", fontSize = 24.sp, color = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable private fun SettingToggle(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 54.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, modifier = Modifier.weight(1f), fontSize = 16.sp)
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

@Composable private fun NativeBookCover(subject: String) {
    val palette = when (subject) {
        "Մաթեմատիկա" -> listOf(Color(0xFF152F39), Color(0xFF166E83))
        "Կենսաբանություն" -> listOf(Color(0xFF093F39), Color(0xFF2A9870))
        "Հայոց պատմություն" -> listOf(Color(0xFF302921), Color(0xFFA47A37))
        "Հայոց լեզու" -> listOf(Color(0xFF202742), Color(0xFF5461AA))
        "Ֆիզիկա" -> listOf(Color(0xFF153244), Color(0xFF138A88))
        else -> listOf(Color(0xFF103D44), Color(0xFF147C70))
    }
    Box(
        modifier = Modifier.width(70.dp).height(94.dp)
            .background(Brush.linearGradient(palette), RoundedCornerShape(12.dp))
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("S", fontSize = 31.sp, fontWeight = FontWeight.Black,
                color = Color.White)
            Text("SHTEMARM", fontSize = 8.sp, fontWeight = FontWeight.Bold,
                color = Color.White)
        }
    }
}
