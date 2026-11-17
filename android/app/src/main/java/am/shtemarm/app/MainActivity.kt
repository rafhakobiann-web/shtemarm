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
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
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
private enum class Page { HOME, SUBJECTS, BOOKS, SECTIONS, STUDY, RESULT, PROGRESS, SETTINGS, EXAMS, GAMES, TOOLS, POMODORO, MATH, ADVANCED, SAVED, HANDBOOK }

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
    // No backdrop capture in the performance-first Android variant.
    val glassHazeState: HazeState? = null
    var dark by remember { mutableStateOf(progress.darkMode) }
    var largeText by remember { mutableStateOf(progress.largeText) }
    var immediateFeedback by remember { mutableStateOf(progress.showAnswersImmediately) }
    var accent by remember { mutableStateOf(progress.accent) }
    var surfaceStyle by remember { mutableStateOf(if (progress.surfaceStyle == "liquid") "soft" else progress.surfaceStyle) }
    var glassIntensity by remember { mutableStateOf(progress.glassIntensity) }
    var glassBackground by remember { mutableStateOf(progress.glassBackground) }
    var glassBlur by remember { mutableIntStateOf(progress.glassBlur) }
    var glassClarity by remember { mutableIntStateOf(progress.glassClarity) }
    var glassReflection by remember { mutableIntStateOf(progress.glassReflection) }
    var pendingRevisionSection by remember { mutableStateOf<String?>(null) }
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
    var finishingSession by remember { mutableStateOf(false) }
    // ActivityResult callbacks run on the main thread. File providers may be slow:
    // keep SAF reads/writes and JSON snapshot parsing off the UI dispatcher.
    val backupScope = rememberCoroutineScope()
    val exportProgress = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/json")
    ) { uri ->
        if (uri == null) {
            backupMessage = NativeStudyGuide.label(studyLanguage, "Պահպանումը չեղարկված է։", "Save cancelled.", "Сохранение отменено.")
        } else {
            backupMessage = NativeStudyGuide.label(studyLanguage, "Պահպանվում է…", "Saving…", "Сохранение…")
            backupScope.launch {
                backupMessage = try {
                    withContext(Dispatchers.IO) {
                        context.contentResolver.openOutputStream(uri)?.use { stream ->
                            stream.write(progress.exportSnapshot().toByteArray(StandardCharsets.UTF_8))
                        } ?: error("Cannot open backup destination")
                    }
                    NativeStudyGuide.label(studyLanguage, "Առաջընթացի կրկնօրինակը պահպանվեց։", "Progress backup saved.", "Резервная копия прогресса сохранена.")
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    NativeStudyGuide.label(studyLanguage, "Կրկնօրինակը պահպանել չհաջողվեց։", "Could not save the backup.", "Не удалось сохранить резервную копию.")
                }
            }
        }
    }
    val importProgress = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri == null) {
            backupMessage = NativeStudyGuide.label(studyLanguage, "Վերականգնումը չեղարկված է։", "Restore cancelled.", "Восстановление отменено.")
        } else {
            backupMessage = NativeStudyGuide.label(studyLanguage, "Վերականգնվում է…", "Restoring…", "Восстановление…")
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
                        surfaceStyle = if (progress.surfaceStyle == "liquid") "soft" else progress.surfaceStyle
                        glassIntensity = progress.glassIntensity
                        glassBackground = progress.glassBackground
                        glassBlur = progress.glassBlur
                        glassClarity = progress.glassClarity
                        glassReflection = progress.glassReflection
                        studyLanguage = progress.studyLanguage
                        dailyTarget = progress.dailyQuestionTarget
                        backupMessage = NativeStudyGuide.label(studyLanguage, "Առաջընթացը հաջողությամբ վերականգնվեց։", "Progress restored successfully.", "Прогресс успешно восстановлен.")
                    } else {
                        backupMessage = NativeStudyGuide.label(studyLanguage, "Այս ֆայլը Shtemarm-ի վավեր կրկնօրինակ չէ։", "This file is not a valid Shtemarm backup.", "Этот файл не является допустимой копией Shtemarm.")
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    backupMessage = NativeStudyGuide.label(studyLanguage, "Կրկնօրինակը բացել չհաջողվեց։", "Could not open the backup.", "Не удалось открыть резервную копию.")
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
            Page.POMODORO -> Page.TOOLS
            Page.BOOKS -> Page.SUBJECTS
            else -> Page.HOME
        }
    }

    fun begin(pool: List<StudyQuestion>, count: Int, name: String, shuffle: Boolean = true) {
        if (pool.isEmpty()) return
        if (page != Page.RESULT) sessionOrigin = page
        session = (if (shuffle) pool.shuffled() else pool).take(count.coerceAtLeast(1))
        sessionTitle = name
        finishingSession = false
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
        chapterFilter = pendingRevisionSection ?: ""
        pendingRevisionSection = null
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
                        val bookQuestions = repository.load(entry).allQuestions
                        collected += withContext(Dispatchers.Default) {
                            bookQuestions.filter { it.id in ids }
                        }
                    } catch (e: CancellationException) {
                        throw e
                    } catch (_: Exception) { /* Keep questions from other readable books. */ }
                }
                // Scored-math reads are synchronous. Keep IO on the IO dispatcher,
                // and filter the potentially large question bank on Default.
                for (part in 1..2) {
                    if (ids.any { it.startsWith("math:matem-$part:") }) {
                        try {
                            val mathQuestions = withContext(Dispatchers.IO) {
                                loadScoredMath(context, part).allQuestions
                            }
                            collected += withContext(Dispatchers.Default) {
                                mathQuestions.filter { it.id in ids }
                            }
                        } catch (e: CancellationException) {
                            throw e
                        } catch (_: Exception) { /* Other review questions still work. */ }
                    }
                }
            }
            // Deduplicating large saved-question lists is CPU work, not UI work.
            val matches = withContext(Dispatchers.Default) {
                collected.distinctBy { it.id }
            }
            savedQuestions = matches
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            // Do not crash the saved-questions screen or report an error as an empty list.
            savedLoadError = NativeStudyGuide.label(studyLanguage, "Պահպանված հարցերը բեռնել չհաջողվեց։ Կրկին փորձիր ավելի ուշ։", "Could not load saved questions. Please try again later.", "Не удалось загрузить сохранённые вопросы. Повторите попытку позже.")
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
                            Page.TOOLS, Page.POMODORO -> 4
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
                    transitionSpec = {
                        // Lightweight, GPU-friendly motion: avoid blur on large question lists.
                        val forward = targetState.ordinal >= initialState.ordinal
                        (slideInHorizontally(
                            animationSpec = tween(260, easing = FastOutSlowInEasing),
                            initialOffsetX = { width -> if (forward) width / 12 else -width / 12 }
                        ) + fadeIn(tween(210))) togetherWith
                            (slideOutHorizontally(
                                animationSpec = tween(200, easing = FastOutSlowInEasing),
                                targetOffsetX = { width -> if (forward) -width / 16 else width / 16 }
                            ) + fadeOut(tween(160)))
                    },
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
                    Page.TOOLS -> Column(Modifier.fillMaxSize().padding(padding)) {
                        OutlinedButton(
                            onClick = { page = Page.POMODORO },
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp)
                        ) { Text(NativeStudyGuide.label(studyLanguage, "Ուսման ժամանակաչափ", "Study timer", "Таймер занятий")) }
                        Box(Modifier.weight(1f)) { NativeTools(repository) { selectedSubject, pool, count, name ->
                            subject = selectedSubject
                            begin(pool, count, name)
                        } }
                    }
                    Page.POMODORO -> Box(Modifier.fillMaxSize().padding(padding)) {
                        NativePomodoro(studyLanguage)
                    }
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
                                Text(NativeStudyGuide.label(studyLanguage, "Քո ուսումնական առաջընթացը", "Your learning progress", "Ваш учебный прогресс"), fontSize = 23.sp, fontWeight = FontWeight.Black)
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
                                ) { Text(NativeStudyGuide.label(studyLanguage, "Մանրամասն առաջընթաց", "Detailed progress", "Подробный прогресс")) }
                            }
                            item {
                                AcademyEyebrow("Ուսումնական գրադարան")
                                Spacer(Modifier.height(9.dp))
                                AcademySectionTitle("Գտիր քո շտեմարանը")
                                Spacer(Modifier.height(5.dp))
                                Text(NativeStudyGuide.label(studyLanguage, "Բացիր առարկան՝ տեսնելու բոլոր գրքերն ու հարցաշարերը։", "Open a subject to see its books and question sets.", "Откройте предмет, чтобы увидеть книги и задания."),
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
                                Text(NativeStudyGuide.label(studyLanguage, "Ընտրիր առարկան և ստուգիր պատրաստվածությունդ։", "Choose a subject and test your readiness.", "Выберите предмет и проверьте свою подготовку."),
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
                            Text(NativeStudyGuide.label(studyLanguage, "Բացիր առարկան՝ տեսնելու բոլոր գրքերն ու հարցաշարերը։", "Open a subject to see its books and question sets.", "Откройте предмет, чтобы увидеть книги и задания."),
                                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                        }
                        item {
                            OutlinedTextField(
                                value = subjectFilter,
                                onValueChange = { subjectFilter = it.take(80) },
                                label = { Text(NativeStudyGuide.label(studyLanguage, "Փնտրել առարկա", "Search subjects", "Поиск предмета")) },
                                placeholder = { Text(NativeStudyGuide.label(studyLanguage, "Օրինակ՝ կենսաբանություն", "For example: Biology", "Например: биология")) },
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
                            Text(NativeStudyGuide.label(studyLanguage, "Ընտրիր շտեմարան կամ թեստերի հավաքածու։", "Choose a question book or test collection.", "Выберите сборник заданий или тестов."),
                                fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        item {
                            OutlinedTextField(
                                value = bookFilter,
                                onValueChange = { bookFilter = it.take(80) },
                                label = { Text(NativeStudyGuide.label(studyLanguage, "Փնտրել գիրք", "Search books", "Поиск книги")) },
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
                                label = { Text(NativeStudyGuide.label(studyLanguage, "Փնտրել բաժին կամ թեմա", "Search sections or topics", "Поиск раздела или темы")) },
                                placeholder = { Text(NativeStudyGuide.label(studyLanguage, "Մուտքագրիր թեմայի անվանումը", "Enter a topic name", "Введите название темы")) },
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
                            ) { Text(NativeStudyGuide.label(studyLanguage, "Բազմաքայլ առաջադրանքներ · համապատասխանեցում, թվային, հերթականություն", "Multi-step tasks · matching, numeric, sequencing", "Многоэтапные задания · соответствие, числа, последовательности")) }
                        }
                        if (loading) item {
                            LinearProgressIndicator(Modifier.fillMaxWidth())
                            Text(NativeStudyGuide.label(studyLanguage, "Բացվում է…", "Loading…", "Загрузка…"))
                        } else if (loadError.isNotBlank()) item {
                            Text(loadError, color = MaterialTheme.colorScheme.error)
                        } else {
                            val data = loaded
                            if (data == null || data.allQuestions.isEmpty()) item {
                                Text(NativeStudyGuide.label(studyLanguage, "Այս գրքում առայժմ ստուգված բազմընտրանի հարցեր հասանելի չեն։", "No verified multiple-choice questions are available for this book yet.", "В этом сборнике пока нет проверенных вопросов с выбором ответа."))
                            } else {
                                val pool = data.allQuestions
                                item {
                                    Text("Հասանելի հարցեր՝ " + pool.size, fontWeight = FontWeight.SemiBold)
                                    Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                                        Button(onClick = { begin(pool, 10, "Արագ վարժանք") },
                                            modifier = Modifier.weight(1f)) { Text(NativeStudyGuide.label(studyLanguage, "10 հարց", "10 questions", "10 вопросов")) }
                                        OutlinedButton(onClick = { begin(pool, 30, "Պատահական թեստ") },
                                            modifier = Modifier.weight(1f)) { Text(NativeStudyGuide.label(studyLanguage, "30 հարց", "30 questions", "30 вопросов")) }
                                    }
                                    OutlinedButton(
                                        onClick = { begin(pool, pool.size, "Ամբողջ շտեմարան") },
                                        modifier = Modifier.fillMaxWidth()
                                    ) { Text(NativeStudyGuide.label(studyLanguage, "Բոլոր հասանելի հարցերը", "All available questions", "Все доступные вопросы")) }
                                    Text(NativeStudyGuide.label(studyLanguage, "Սրանք ուսումնական թեստեր են․ դրանք չեն կրկնում ԳԹԿ պաշտոնական քննության ամբողջ կառուցվածքը։", "These are practice tests and do not reproduce the full official exam format.", "Это тренировочные тесты, а не полная копия официального экзамена."),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                                }
                                item { Text(NativeStudyGuide.label(studyLanguage, "Բաժիններ", "Sections", "Разделы"), fontWeight = FontWeight.Bold, fontSize = 21.sp) }
                                val visibleSectionIndexes = data.sections.indices.filter { idx ->
                                    BookStudyHelpers.matches(chapterFilter, data.sections[idx].title) ||
                                        (chapterFilter.trim().toIntOrNull() == idx + 1)
                                }
                                if (visibleSectionIndexes.isEmpty()) item {
                                    Text(NativeStudyGuide.label(studyLanguage, "Այս անունով բաժին չգտնվեց։ Փորձիր այլ բառ։", "No section found. Try another search.", "Раздел не найден. Попробуйте другой запрос."),
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
                                        Text(if (saved)
                                            NativeStudyGuide.label(studyLanguage, "★ Հեռացնել պահպանվածներից", "★ Remove bookmark", "★ Удалить из сохранённого")
                                        else NativeStudyGuide.label(studyLanguage, "☆ Պահպանել հարցը", "☆ Save question", "☆ Сохранить вопрос"))
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
                                        Text(if (chosen == q.correctIndex)
                                            NativeStudyGuide.label(studyLanguage, "Ճիշտ է ✓", "Correct ✓", "Верно ✓")
                                        else NativeStudyGuide.label(studyLanguage, "Սխալ պատասխան", "Incorrect answer", "Неверный ответ"),
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
                                                // Do not send Biology, History or Physics students to English grammar.
                                                if (subject == "Մաթեմատիկա" || subject == "Անգլերեն") {
                                                    TextButton(onClick = {
                                                        handbookSubject = subject
                                                        page = Page.HANDBOOK
                                                    }) {
                                                        Text(NativeStudyGuide.label(studyLanguage,"Կարդալ կանոնները","Study the rules","Изучить правила"))
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    Button(
                                        onClick = {
                                            if (finishingSession) return@Button
                                            if (sessionIndex + 1 >= session.size) {
                                                // SharedPreferences.commit() performs synchronous disk I/O.
                                                // Keep it off the Compose click/UI thread and guard double taps.
                                                finishingSession = true
                                                val finishedSubject = subject
                                                val finishedScore = score
                                                val finishedSession = session
                                                val finishedSessionId = sessionId
                                                val finishedCorrectIds = correctIds
                                                backupScope.launch {
                                                    try {
                                                        val saved = withContext(Dispatchers.IO) {
                                                            val committed = progress.saveSessionOnce(
                                                                finishedSubject, finishedScore,
                                                                finishedSession.size, finishedSessionId
                                                            )
                                                            if (committed) {
                                                                progress.recordMistakes(finishedSession, finishedCorrectIds)
                                                            }
                                                            committed
                                                        }
                                                        if (saved) progressVersion++
                                                        page = Page.RESULT
                                                    } catch (e: CancellationException) {
                                                        throw e
                                                    } catch (_: Exception) {
                                                        // Do not silently report an unsaved result as saved.
                                                        backupMessage = "Արդյունքը պահպանել չհաջողվեց։"
                                                    } finally {
                                                        finishingSession = false
                                                    }
                                                }
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
                        Text(NativeStudyGuide.label(studyLanguage, "Վարժանքն ավարտվեց", "Practice complete", "Тренировка завершена"), fontSize = 26.sp, fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center)
                        Spacer(Modifier.height(24.dp))
                        Text(score.toString() + " / " + session.size,
                            fontSize = 40.sp, fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary)
                        Text(NativeStudyGuide.label(studyLanguage, "Ճիշտ պատասխան", "Correct answer", "Правильный ответ"), color = MaterialTheme.colorScheme.onSurfaceVariant)
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
                            Text(NativeStudyGuide.label(studyLanguage, "Սա մոտավոր գնահատական է և չի համարվում լեզվի իմացության պաշտոնական հավաստագիր։", "This estimate is not an official language certificate.", "Эта оценка не является официальным языковым сертификатом."),
                                fontSize = 12.sp, textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Spacer(Modifier.height(26.dp))
                        Button(onClick = { begin(session, session.size, sessionTitle) },
                            modifier = Modifier.fillMaxWidth()) { Text(NativeStudyGuide.label(studyLanguage, "Կրկնել վարժանքը", "Repeat practice", "Повторить тренировку")) }
                        val missed = session.filter { it.id !in correctIds }
                        if (missed.isNotEmpty()) {
                            OutlinedButton(
                                onClick = { begin(missed, missed.size, "Սխալների կրկնություն") },
                                modifier = Modifier.fillMaxWidth()
                            ) { Text("Կրկնել սխալ պատասխանները · " + missed.size) }
                        }
                        OutlinedButton(onClick = { page = Page.PROGRESS },
                            modifier = Modifier.fillMaxWidth()) { Text(NativeStudyGuide.label(studyLanguage, "Իմ առաջընթացը", "My progress", "Мой прогресс")) }
                        TextButton(onClick = { page = sessionOrigin }) { Text(NativeStudyGuide.label(studyLanguage, "Վերադառնալ", "Go back", "Назад")) }
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
                                    label = { Text(NativeStudyGuide.label(studyLanguage, "Սխալներ", "Mistakes", "Ошибки")) }
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
                                    ) { Text(NativeStudyGuide.label(studyLanguage, "10 հարց", "10 questions", "10 вопросов")) }
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
                                    ) { Text(NativeStudyGuide.label(studyLanguage, "Բոլորը", "All", "Все")) }
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
                                        }) { Text(NativeStudyGuide.label(studyLanguage, "Հեռացնել ցանկից", "Remove from list", "Удалить из списка")) }
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
                        item {
                            val revision = progressVersion.let {
                                AdaptiveRevision.plan(progress.revisionChapters())
                            }
                            ElevatedCard(
                                Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(18.dp)
                            ) {
                                Column(
                                    Modifier.padding(18.dp),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Text(
                                        NativeStudyGuide.label(studyLanguage,
                                            "Իմ կրկնության ուղին", "My revision path", "Мой план повторения"),
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.titleMedium
                                    )
                                    Text(
                                        NativeStudyGuide.label(studyLanguage,
                                            "Առաջարկությունները հիմնված են քո իրական արդյունքների վրա։",
                                            "Recommendations are based on your actual results.",
                                            "Рекомендации основаны на ваших результатах."),
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                    if (revision.isEmpty()) {
                                        Text(NativeStudyGuide.label(studyLanguage,
                                            "Լուծիր առաջին բաժինը՝ անհատական ուղի ստանալու համար։",
                                            "Complete a section to unlock your personal route.",
                                            "Пройдите раздел, чтобы получить личный план."))
                                    } else {
                                        revision.forEach { step ->
                                            val asset = step.chapterKey.substringBefore('#')
                                            val chapterNumber = step.chapterKey.substringAfter('#')
                                            val targetBook = BookCatalog.books.firstOrNull { it.asset == asset }
                                            if (targetBook != null) {
                                                OutlinedButton(
                                                    onClick = {
                                                        subject = targetBook.subject
                                                        pendingRevisionSection = if (book == targetBook) null else chapterNumber
                                                        chapterFilter = chapterNumber
                                                        book = targetBook
                                                        page = Page.SECTIONS
                                                    },
                                                    modifier = Modifier.fillMaxWidth()
                                                ) {
                                                    Text(
                                                        targetBook.title + " · " +
                                                            NativeStudyGuide.label(studyLanguage,
                                                                "Բաժին ", "Section ", "Раздел ") + chapterNumber,
                                                        maxLines = 2
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
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
