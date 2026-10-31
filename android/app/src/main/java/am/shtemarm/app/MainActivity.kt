package am.shtemarm.app

import android.os.Bundle
import android.Manifest
import android.os.Build
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import java.util.UUID
import java.io.ByteArrayOutputStream
import java.nio.charset.StandardCharsets
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import dev.chrisbanes.haze.HazeState

private val BrandTeal = Color(0xFF0B766B)
private enum class Page { HOME, SUBJECTS, BOOKS, SECTIONS, STUDY, RESULT, PROGRESS, SETTINGS, EXAMS, GAMES, TOOLS, MATH, ADVANCED, SAVED, HANDBOOK }

class MainActivity : ComponentActivity() {
    override fun onResume() {
        super.onResume()
        StudyReminders.markOpened(applicationContext)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // The full study UI must be available in both debug and release builds.
        setContent { NativeShtemarm() }
    }
}

/** Android-native UI. No WebView, Javascript or embedded website is used. */
@Composable
private fun NativeShtemarm() {
    val context = LocalContext.current.applicationContext
    val repository = remember { QuestionRepository(context) }
    val progress = remember { StudyProgress(context) }
    val glassHazeState = remember { HazeState() }
    var dark by remember { mutableStateOf(progress.darkMode) }
    var largeText by remember { mutableStateOf(progress.largeText) }
    var immediateFeedback by remember { mutableStateOf(progress.showAnswersImmediately) }
    var accent by remember { mutableStateOf(progress.accent) }
    var surfaceStyle by remember { mutableStateOf(progress.surfaceStyle) }
    var glassIntensity by remember { mutableStateOf(progress.glassIntensity) }
    var glassBackground by remember { mutableStateOf(progress.glassBackground) }
    var glassBlur by remember { mutableIntStateOf(progress.glassBlur) }
    var glassClarity by remember { mutableIntStateOf(progress.glassClarity) }
    var glassReflection by remember { mutableIntStateOf(progress.glassReflection) }
    var progressVersion by remember { mutableIntStateOf(0) }
    var studyLanguage by remember { mutableStateOf(progress.studyLanguage) }
    var dailyTarget by remember { mutableIntStateOf(progress.dailyQuestionTarget) }
    var remindersEnabled by remember { mutableStateOf(StudyReminders.enabled(context)) }
    val requestNotificationPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            StudyReminders.setEnabled(context, true)
            remindersEnabled = true
        } else {
            StudyReminders.setEnabled(context, false)
            remindersEnabled = false
        }
    }
    var handbookSubject by remember { mutableStateOf("Անգլերեն") }
    var showExplanation by remember { mutableStateOf(false) }

    var page by remember { mutableStateOf(Page.HOME) }
    var sessionOrigin by remember { mutableStateOf(Page.SECTIONS) }
    var subject by remember { mutableStateOf(BookCatalog.subjects.first()) }
    var book by remember { mutableStateOf<StudyBook?>(null) }
    var loaded by remember { mutableStateOf<LoadedBook?>(null) }
    var loading by remember { mutableStateOf(false) }
    var loadError by remember { mutableStateOf("") }
    var subjectFilter by remember { mutableStateOf("") }
    var bookFilter by remember { mutableStateOf("") }
    var chapterFilter by remember { mutableStateOf("") }
    var reviewMistakes by remember { mutableStateOf(false) }

    var session by remember { mutableStateOf<List<StudyQuestion>>(emptyList()) }
    var sessionTitle by remember { mutableStateOf("") }
    var sessionIndex by remember { mutableIntStateOf(0) }
    var chosen by remember { mutableIntStateOf(-1) }
    var score by remember { mutableIntStateOf(0) }
    var correctIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    var sessionId by remember { mutableStateOf("") }
    var backupMessage by remember { mutableStateOf("") }
    // ActivityResult callbacks run on the main thread. File providers may be slow:
    // keep SAF reads/writes and JSON snapshot parsing off the UI dispatcher.
    val backupScope = rememberCoroutineScope()
    val exportProgress = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/json")
    ) { uri ->
        if (uri == null) {
            backupMessage = "Պահպանումը չեղարկված է։"
        } else {
            backupMessage = "Պահպանվում է…"
            backupScope.launch {
                backupMessage = try {
                    withContext(Dispatchers.IO) {
                        context.contentResolver.openOutputStream(uri)?.use { stream ->
                            stream.write(progress.exportSnapshot().toByteArray(StandardCharsets.UTF_8))
                        } ?: error("Cannot open backup destination")
                    }
                    "Առաջընթացի կրկնօրինակը պահպանվեց։"
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    "Կրկնօրինակը պահպանել չհաջողվեց։"
                }
            }
        }
    }
    val importProgress = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri == null) {
            backupMessage = "Վերականգնումը չեղարկված է։"
        } else {
            backupMessage = "Վերականգնվում է…"
            backupScope.launch {
                try {
                    val restored = withContext(Dispatchers.IO) {
                        val content = context.contentResolver.openInputStream(uri)?.use { stream ->
                            // API 24-compatible bounded read, including older Android phones.
                            val output = ByteArrayOutputStream()
                            val buffer = ByteArray(8192)
                            while (true) {
                                val count = stream.read(buffer)
                                if (count < 0) break
                                if (output.size() + count > 1_048_576) {
                                    error("Backup file exceeds 1 MiB")
                                }
                                output.write(buffer, 0, count)
                            }
                            output.toString(StandardCharsets.UTF_8.name())
                        } ?: error("Cannot open backup file")
                        progress.importSnapshot(content)
                    }
                    if (restored) {
                        progressVersion++
                        dark = progress.darkMode
                        largeText = progress.largeText
                        immediateFeedback = progress.showAnswersImmediately
                        accent = progress.accent
                        surfaceStyle = progress.surfaceStyle
                        glassIntensity = progress.glassIntensity
                        glassBackground = progress.glassBackground
                        glassBlur = progress.glassBlur
                        glassClarity = progress.glassClarity
                        glassReflection = progress.glassReflection
                        studyLanguage = progress.studyLanguage
                        dailyTarget = progress.dailyQuestionTarget
                        backupMessage = "Առաջընթացը հաջողությամբ վերականգնվեց։"
                    } else {
                        backupMessage = "Այս ֆայլը Shtemarm-ի վավեր կրկնօրինակ չէ։"
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    backupMessage = "Կրկնօրինակը բացել չհաջողվեց։"
                }
            }
        }
    }
    var savedQuestions by remember { mutableStateOf<List<StudyQuestion>>(emptyList()) }
    var savedLoading by remember { mutableStateOf(false) }
    var savedLoadError by remember { mutableStateOf("") }

    // Maintain independent scroll positions for each main screen.
    val homeScroll = rememberLazyListState()
    val subjectsScroll = rememberLazyListState()
    val booksScroll = rememberLazyListState()
    val sectionsScroll = rememberLazyListState()
    val studyScroll = rememberLazyListState()
    val savedScroll = rememberLazyListState()
    val progressScroll = rememberLazyListState()
    LaunchedEffect(sessionIndex, session) { studyScroll.scrollToItem(0) }
    LaunchedEffect(book) { sectionsScroll.scrollToItem(0) }
    LaunchedEffect(subject) {
        booksScroll.scrollToItem(0)
        bookFilter = ""
    }

    fun back() {
        page = when(page) {
            Page.STUDY -> sessionOrigin
            Page.RESULT -> sessionOrigin
            Page.SECTIONS -> Page.BOOKS
            Page.MATH -> Page.BOOKS
            Page.ADVANCED -> Page.SECTIONS
            Page.HANDBOOK -> Page.HOME
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
        showExplanation = false
        score = 0
        correctIds = emptySet()
        sessionId = UUID.randomUUID().toString()
        page = Page.STUDY
    }

    LaunchedEffect(book) {
        val chosenBook = book
        if (chosenBook == null) {
            // Leaving the book screen must not preserve a stale loading spinner.
            loaded = null
            loadError = ""
            loading = false
            return@LaunchedEffect
        }
        chapterFilter = ""
        progress.recordLastBook(chosenBook)
        // Mathematics uses a separate verified text/answer reader.
        if (chosenBook.subject == "Մաթեմատիկա") {
            loaded = null
            loadError = ""
            loading = false
            return@LaunchedEffect
        }
        loading = true
        loadError = ""
        loaded = null
        try {
            loaded = repository.load(chosenBook)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            loadError = "Հնարավոր չեղավ բացել շտեմարանը։ " + (e.localizedMessage ?: "")
        } finally {
            // Also clear the spinner when a book load is cancelled.
            loading = false
        }
    }

    LaunchedEffect(page, reviewMistakes) {
        if (page != Page.SAVED) {
            savedLoadError = ""
            savedLoading = false
            return@LaunchedEffect
        }
        savedLoading = true
        savedLoadError = ""
        savedQuestions = emptyList()
        try {
            val ids = if (reviewMistakes) progress.mistakeIds() else progress.bookmarkedIds()
            // load() already dispatches asset reads and parsing to IO.
            // Avoid a redundant outer IO dispatch around the aggregation.
            val collected = mutableListOf<StudyQuestion>()
            if (ids.isNotEmpty()) {
                val sourceAssets = SessionGuards.sourceAssets(ids)
                for (entry in BookCatalog.books.filter {
                    it.subject != "Մաթեմատիկա" && it.asset in sourceAssets
                }.distinctBy { it.asset }) {
                    try {
                        collected += repository.load(entry).allQuestions.filter { it.id in ids }
                    } catch (e: CancellationException) {
                        throw e
                    } catch (_: Exception) { /* Keep questions from other readable books. */ }
                }
                // Scored-math reads are synchronous; dispatch only those reads to IO.
                withContext(Dispatchers.IO) {
                    for (part in 1..2) {
                        if (ids.any { it.startsWith("math:matem-$part:") }) {
                            try {
                                collected += loadScoredMath(context, part).allQuestions.filter { it.id in ids }
                            } catch (e: CancellationException) {
                                throw e
                            } catch (_: Exception) { /* Other review questions still work. */ }
                        }
                    }
                }
            }
            val matches = collected.distinctBy { it.id }
            savedQuestions = matches
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            // Do not crash the saved-questions screen or report an error as an empty list.
            savedLoadError = "Պահպանված հարցերը բեռնել չհաջողվեց։ Կրկին փորձիր ավելի ուշ։"
        } finally {
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
            LocalGlassIntensity provides glassIntensity,
            LocalGlassHazeState provides glassHazeState,
            LocalGlassBackdrop provides glassBackground,
            LocalGlassBlur provides glassBlur,
            LocalGlassClarity provides glassClarity,
            LocalGlassReflection provides glassReflection
        ) {
            AcademyAmbientBackdrop(Modifier.fillMaxSize()) {
            Scaffold(
                containerColor = Color.Transparent,
                // Transparent scaffold cannot infer a readable content color.
                // Keep default text/icons legible in both light and dark mode.
                contentColor = MaterialTheme.colorScheme.onSurface,
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
                            Page.SUBJECTS, Page.BOOKS, Page.SECTIONS, Page.MATH, Page.ADVANCED, Page.HANDBOOK -> 1
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
                AnimatedContent(
                    targetState = page,
                    modifier = Modifier.fillMaxSize(),
                    transitionSpec = { fadeIn(tween(120)) togetherWith fadeOut(tween(90)) },
                    label = "native screen transition"
                ) { screen ->
                when (screen) {
                    Page.HANDBOOK -> Box(Modifier.fillMaxSize().padding(padding)) {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            item {
                                ScreenHeading(
                                    NativeStudyGuide.label(studyLanguage, "Կանոններ և բացատրություններ", "Rules and explanations", "Правила и объяснения"),
                                    NativeStudyGuide.label(studyLanguage, "Աշխատում է առանց ինտերնետի", "Works offline", "Работает без интернета")
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    listOf("Անգլերեն", "Մաթեմատիկա").forEach { name ->
                                        FilterChip(
                                            selected = handbookSubject == name,
                                            onClick = { handbookSubject = name },
                                            label = { Text(if (name == "Անգլերեն") NativeStudyGuide.label(studyLanguage,"Անգլերեն","English","Английский") else NativeStudyGuide.label(studyLanguage,"Մաթեմատիկա","Mathematics","Математика")) }
                                        )
                                    }
                                }
                            }
                            if (handbookSubject == "Անգլերեն") {
                                items(NativeStudyGuide.grammar) { rule ->
                                    ElevatedCard(shape = RoundedCornerShape(18.dp)) {
                                        Column(Modifier.padding(18.dp)) {
                                            Text(rule.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                            Spacer(Modifier.height(8.dp))
                                            Text(rule.explanation(studyLanguage), lineHeight = 24.sp)
                                        }
                                    }
                                }
                            } else {
                                items(NativeStudyGuide.math) { formula ->
                                    ElevatedCard(shape = RoundedCornerShape(18.dp)) {
                                        Column(Modifier.padding(18.dp)) {
                                            Text(formula.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                            Spacer(Modifier.height(8.dp))
                                            Text(formula.explanation(studyLanguage), lineHeight = 24.sp)
                                        }
                                    }
                                }
                            }
                            item { Spacer(Modifier.height(24.dp)) }
                        }
                    }
                    Page.ADVANCED -> {
                        val activeBook = book
                        if (activeBook != null) Box(Modifier.fillMaxSize().padding(padding)) { NativeAdvancedPractice(activeBook) { page = Page.SECTIONS } }
                    }
                    Page.MATH -> Box(Modifier.fillMaxSize().padding(padding)) {
                        NativeMathPractice(
                            bookPart = if (book?.title?.contains("Մաս 2") == true) 2 else 1
                        ) { pool, count, name ->
                            subject = "Մաթեմատիկա"
                            begin(pool, count, name)
                        }
                    }
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
                        val lastBook = progressVersion.let { progress.lastBook() }
                        val mistakesCount = progress.mistakeIds().size
                        LazyColumn(
                            Modifier.fillMaxSize().padding(padding).padding(horizontal = 15.dp),
                        state = homeScroll,
                            verticalArrangement = Arrangement.spacedBy(17.dp)
                        ) {
                            item { Spacer(Modifier.height(3.dp)) }
                            item { AcademyHero(onSubjects = { page = Page.SUBJECTS }, onExams = { page = Page.EXAMS }) }
                            item {
                                val today = progressVersion.let { progress.answeredToday() }
                                ElevatedCard(Modifier.fillMaxWidth(), shape = RoundedCornerShape(20.dp)) {
                                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text(NativeStudyGuide.label(studyLanguage,
                                            "Օրվա ուսումնական նպատակը", "Today's study goal", "Цель на сегодня"),
                                            fontWeight = FontWeight.Bold)
                                        Text("$today / $dailyTarget " + NativeStudyGuide.label(studyLanguage,
                                            "հարց", "questions", "вопросов"))
                                        LinearProgressIndicator(
                                            progress = { StudyGoals.completion(dailyTarget, today) },
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                        Text(if (StudyGoals.remaining(dailyTarget, today) == 0)
                                            NativeStudyGuide.label(studyLanguage, "Այսօրվա նպատակը կատարված է։",
                                                "Today's goal is complete.", "Цель на сегодня выполнена.")
                                        else NativeStudyGuide.label(studyLanguage,
                                            "Մնացել է", "Remaining", "Осталось") +
                                            ": " + StudyGoals.remaining(dailyTarget, today),
                                            fontSize = 13.sp)
                                    }
                                }
                            }
                            if (lastBook != null) item {
                                AcademyQuickAction(
                                    Icons.Default.Book,
                                    "Շարունակել ուսումը",
                                    lastBook.subject + " · " + lastBook.title
                                ) {
                                    subject = lastBook.subject
                                    book = lastBook
                                    page = if (lastBook.subject == "Մաթեմատիկա") Page.MATH else Page.SECTIONS
                                }
                            }
                            if (mistakesCount > 0) item {
                                val needsWork = BookCatalog.subjects.map { it to progress.stats(it) }
                                    .filter { it.second.answered >= 5 }
                                    .minByOrNull { it.second.accuracy }
                                if (needsWork != null) {
                                    AcademyQuickAction(Icons.Default.Star,
                                        NativeStudyGuide.label(studyLanguage,
                                            "Առաջարկվող կրկնություն", "Recommended review", "Рекомендуемое повторение"),
                                        needsWork.first + " · " + needsWork.second.accuracy + "% · " +
                                            NativeStudyGuide.label(studyLanguage,
                                                "Սկսիր պահպանված սխալներից", "Start with missed questions",
                                                "Начните с ошибок")
                                    ) { reviewMistakes = true; page = Page.SAVED }
                                }
                            }
                            if (mistakesCount > 0) item {
                                AcademyQuickAction(
                                    Icons.Default.Star,
                                    "Կրկնել սխալները",
                                    "$mistakesCount հարց՝ կրկնելու համար"
                                ) {
                                    reviewMistakes = true
                                    page = Page.SAVED
                                }
                            }
                            item {
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    AcademyQuickAction(Icons.Default.Book, "Շտեմարաններ", "Ընտրիր գիրքը") {
                                        page = Page.SUBJECTS
                                    }
                                    AcademyQuickAction(Icons.Default.Star, "Թեմատիկ աշխատանք", "Ստեղծիր առաջադրանքներ") {
                                        page = Page.TOOLS
                                    }
                                    AcademyQuickAction(Icons.Default.Book,
                                        NativeStudyGuide.label(studyLanguage,"Կանոններ և բացատրություններ","Rules and explanations","Правила и объяснения"),
                                        NativeStudyGuide.label(studyLanguage,"Անգլերեն և մաթեմատիկա · Offline","English and math · Offline","Английский и математика · Offline")) {
                                        page = Page.HANDBOOK
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
                                            AcademyStatCard("Կրկնելու հարցեր", mistakesCount.toString(),
                                                "Պահպանված սխալ պատասխաններ", Icons.Default.Settings)
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
                            items(BookCatalog.subjects, key = { it }) { s ->
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
                        state = subjectsScroll,
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
                        item {
                            OutlinedTextField(
                                value = subjectFilter,
                                onValueChange = { subjectFilter = it.take(80) },
                                label = { Text("Փնտրել առարկա") },
                                placeholder = { Text("Օրինակ՝ կենսաբանություն") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp)
                            )
                        }
                        items(BookCatalog.subjects.filter {
                            BookStudyHelpers.matches(subjectFilter, it)
                        }, key = { it }) { s ->
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
                        state = booksScroll,
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
                        item {
                            OutlinedTextField(
                                value = bookFilter,
                                onValueChange = { bookFilter = it.take(80) },
                                label = { Text("Փնտրել գիրք") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp)
                            )
                        }
                        items(BookCatalog.books.filter {
                            it.subject == subject &&
                                BookStudyHelpers.matches(bookFilter, it.title, it.subject)
                        }, key = { it.asset + ":" + it.title }) { item ->
                            AcademyBookTile(item) {
                                book = item
                                page = if (item.subject == "Մաթեմատիկա") Page.MATH else Page.SECTIONS
                            }
                        }
                        if (subject == "Կենսաբանություն") item {
                            ElevatedCard {
                                Text(
                                    "3-րդ և 4-րդ մասերի ամբողջական ստուգված հարցաշարերը դեռ հասանելի չեն։ " +
                                        "Դրանք չեն ներկայացվում որպես ավարտված գրքեր։",
                                    Modifier.padding(15.dp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 13.sp
                                )
                            }
                        }
                        item { Spacer(Modifier.height(12.dp)) }
                    }
                    Page.SECTIONS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        state = sectionsScroll,
                        verticalArrangement = Arrangement.spacedBy(11.dp)
                    ) {
                        item { ScreenHeading(book?.title ?: "Շտեմարան", subject) }
                        item {
                            OutlinedTextField(
                                value = chapterFilter,
                                onValueChange = { chapterFilter = it.take(100) },
                                label = { Text("Փնտրել բաժին կամ թեմա") },
                                placeholder = { Text("Մուտքագրիր թեմայի անվանումը") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp)
                            )
                        }
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
                                val visibleSectionIndexes = data.sections.indices.filter { idx ->
                                    BookStudyHelpers.matches(chapterFilter, data.sections[idx].title)
                                }
                                if (visibleSectionIndexes.isEmpty()) item {
                                    Text("Այս անունով բաժին չգտնվեց։ Փորձիր այլ բառ։",
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                items(visibleSectionIndexes, key = { idx -> data.sections[idx].title + ":" + idx }) { sectionIndex ->
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
                        state = studyScroll,
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
                                    val animatedProgress by animateFloatAsState(
                                        targetValue = (sessionIndex + 1).toFloat() / session.size,
                                        animationSpec = tween(durationMillis = 260),
                                        label = "study question progress"
                                    )
                                    LinearProgressIndicator(
                                        progress = { animatedProgress },
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
                                    val animatedBg by animateColorAsState(
                                        targetValue = bg,
                                        animationSpec = tween(durationMillis = 190),
                                        label = "answer feedback"
                                    )
                                    Card(
                                        modifier = Modifier.fillMaxWidth()
                                            .clickable(enabled = chosen < 0) {
                                                val evaluation = SessionGuards.evaluate(
                                                    chosen, n, q.correctIndex, q.choices.size
                                                )
                                                if (evaluation.accepted) {
                                                    chosen = n
                                                    if (evaluation.correct) {
                                                        score++
                                                        correctIds = correctIds + q.id
                                                    }
                                                }
                                            },
                                        colors = CardDefaults.cardColors(containerColor = animatedBg),
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

                                    }
                                    OutlinedButton(
                                        modifier = Modifier.fillMaxWidth(),
                                        onClick = { showExplanation = !showExplanation }
                                    ) {
                                        Text(if (showExplanation)
                                            NativeStudyGuide.label(studyLanguage,"Թաքցնել բացատրությունը","Hide explanation","Скрыть объяснение")
                                        else NativeStudyGuide.label(studyLanguage,"Բացել բացատրությունը","Show explanation","Показать объяснение"))
                                    }
                                    if (showExplanation) {
                                        ElevatedCard(shape = RoundedCornerShape(16.dp)) {
                                            Column(Modifier.padding(16.dp)) {
                                                Text(NativeStudyGuide.label(studyLanguage,"Բացատրություն","Explanation","Объяснение"),
                                                    fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                                Spacer(Modifier.height(8.dp))
                                                Text(NativeStudyGuide.explanation(q,subject,studyLanguage),lineHeight = 24.sp)
                                                Spacer(Modifier.height(8.dp))
                                                TextButton(onClick = {
                                                    handbookSubject = if (subject == "Մաթեմատիկա") "Մաթեմատիկա" else "Անգլերեն"
                                                    page = Page.HANDBOOK
                                                }) {
                                                    Text(NativeStudyGuide.label(studyLanguage,"Կարդալ կանոնները","Study the rules","Изучить правила"))
                                                }
                                            }
                                        }
                                    }
                                    Button(
                                        onClick = {
                                            if (sessionIndex + 1 >= session.size) {
                                                if (progress.saveSessionOnce(subject, score, session.size, sessionId)) {
                                                    progress.recordMistakes(session, correctIds)
                                                    progressVersion++
                                                }
                                                page = Page.RESULT
                                            } else {
                                                sessionIndex++
                                                chosen = -1
                                                showExplanation = false
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
                        state = savedScroll,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            ScreenHeading("Իմ կրկնության հարցերը", "Ընտրիր պահպանված կամ սխալ պատասխանած հարցերը։")
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                FilterChip(
                                    selected = !reviewMistakes,
                                    onClick = { reviewMistakes = false },
                                    label = { Text("☆ Պահպանված") }
                                )
                                FilterChip(
                                    selected = reviewMistakes,
                                    onClick = { reviewMistakes = true },
                                    label = { Text("Սխալներ") }
                                )
                            }
                        }
                        if (savedLoading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
                        else if (savedLoadError.isNotEmpty()) item {
                            Text(savedLoadError, color = MaterialTheme.colorScheme.error)
                        }
                        else if (savedQuestions.isEmpty()) item {
                            Text(
                                if (reviewMistakes) "Դեռ կրկնելու սխալ հարցեր չկան։"
                                else "Դու դեռ հարցեր չես պահպանել։ Վարժանքի ընթացքում սեղմիր «Պահպանել հարցը»։",
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        } else {
                            item {
                                Text("Հասանելի՝ " + savedQuestions.size, fontWeight = FontWeight.Bold)
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        modifier = Modifier.weight(1f),
                                        onClick = {
                                            subject = "Կրկնություն"
                                            begin(
                                                savedQuestions, minOf(10, savedQuestions.size),
                                                if (reviewMistakes) "Սխալների արագ կրկնություն"
                                                else "Պահպանված հարցերի արագ կրկնություն"
                                            )
                                        }
                                    ) { Text("10 հարց") }
                                    OutlinedButton(
                                        modifier = Modifier.weight(1f),
                                        onClick = {
                                            subject = "Կրկնություն"
                                            begin(
                                                savedQuestions, savedQuestions.size,
                                                if (reviewMistakes) "Սխալների կրկնություն"
                                                else "Պահպանված հարցերի կրկնություն"
                                            )
                                        }
                                    ) { Text("Բոլորը") }
                                }
                            }
                            items(savedQuestions, key = { it.id }) { q ->
                                ElevatedCard(Modifier.fillMaxWidth()) {
                                    Column(Modifier.padding(16.dp)) {
                                        Text(q.stem, maxLines = 3)
                                        TextButton(onClick = {
                                            if (reviewMistakes) progress.removeMistake(q.id)
                                            else progress.toggleBookmark(q.id)
                                            savedQuestions = savedQuestions.filterNot { it.id == q.id }
                                            progressVersion++
                                        }) { Text("Հեռացնել ցանկից") }
                                    }
                                }
                            }
                        }
                    }
                    Page.PROGRESS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        state = progressScroll,
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        item { ScreenHeading("Իմ առաջընթացը", "Արդյունքները պահվում են այս սարքում։") }
                        items(BookCatalog.subjects, key = { it }) { s ->
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
                    Page.SETTINGS -> Column(Modifier.fillMaxSize().padding(padding)) {
                        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp),horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("hy","en","ru").forEach { language ->
                                FilterChip(
                                    selected = studyLanguage == language,
                                    onClick = { studyLanguage = language; progress.studyLanguage = language },
                                    label = { Text(language.uppercase()) }
                                )
                            }
                        }
                        Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp)) {
                            Text(NativeStudyGuide.label(studyLanguage,
                                "Օրական քանի՞ հարց", "Daily question goal", "Вопросов в день"),
                                fontWeight = FontWeight.Bold)
                            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                StudyGoals.allowedDailyTargets.sorted().forEach { target ->
                                    FilterChip(selected = dailyTarget == target,
                                        onClick = { dailyTarget = target; progress.dailyQuestionTarget = target },
                                        label = { Text(target.toString()) })
                                }
                            }
                        }
                        Row(
                            Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(Modifier.weight(1f)) {
                                Text(NativeStudyGuide.label(studyLanguage,
                                    "Ուսման հիշեցումներ", "Study reminders", "Напоминания об учёбе"),
                                    fontWeight = FontWeight.SemiBold)
                                Text(NativeStudyGuide.label(studyLanguage,
                                    "Կամավոր․ 3 օր բացակայությունից հետո՝ շաբաթը առավելագույնը մեկ անգամ, 09:00–21:00։",
                                    "Optional. After 3 days away, at most weekly, between 09:00 and 21:00.",
                                    "По желанию. После 3 дней отсутствия, не чаще раза в неделю, с 09:00 до 21:00."),
                                    fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Switch(checked = remindersEnabled, onCheckedChange = { enabled ->
                                if (!enabled) {
                                    StudyReminders.setEnabled(context, false)
                                    remindersEnabled = false
                                } else if (Build.VERSION.SDK_INT >= 33) {
                                    requestNotificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                                } else {
                                    StudyReminders.setEnabled(context, true)
                                    remindersEnabled = true
                                }
                            })
                        }
                        Box(Modifier.weight(1f)) {
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
                            glassBackground = glassBackground,
                            onGlassBackground = {
                                glassBackground = it
                                progress.glassBackground = it
                            },
                            glassBlur = glassBlur,
                            onGlassBlur = {
                                glassBlur = it
                                progress.glassBlur = it
                            },
                            glassClarity = glassClarity,
                            onGlassClarity = {
                                glassClarity = it
                                progress.glassClarity = it
                            },
                            glassReflection = glassReflection,
                            onGlassReflection = {
                                glassReflection = it
                                progress.glassReflection = it
                            },
                            largeText = largeText,
                            onLargeText = { largeText = it; progress.largeText = it },
                            immediateFeedback = immediateFeedback,
                            onFeedback = {
                                immediateFeedback = it
                                progress.showAnswersImmediately = it
                            },
                            backupStatus = backupMessage,
                            onExportBackup = {
                                exportProgress.launch("shtemarm-progress-backup.json")
                            },
                            onImportBackup = {
                                importProgress.launch(arrayOf("application/json", "text/plain"))
                            }
                        )
                        }
                    }
                }
                } // AnimatedContent
            }
            }
        }
    }
}

@Composable private fun ScreenHeading(title: String, subtitle: String) {
    Text(
        title,
        fontFamily = StudyReadingFont,
        fontSize = 27.sp,
        fontWeight = FontWeight.SemiBold,
        lineHeight = 38.sp,
        color = MaterialTheme.colorScheme.onSurface
    )
    Spacer(Modifier.height(6.dp))
    Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Spacer(Modifier.height(13.dp))
}

@Composable private fun SubjectCard(subject: String, onClick: () -> Unit) {
    AcademyGlassPanel(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(22.dp)
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
