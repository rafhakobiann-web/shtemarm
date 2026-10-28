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
private enum class Page { HOME, SUBJECTS, BOOKS, SECTIONS, STUDY, RESULT, PROGRESS, SETTINGS, EXAMS, GAMES, TOOLS, MATH }

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

    fun back() {
        page = when(page) {
            Page.STUDY -> sessionOrigin
            Page.RESULT -> sessionOrigin
            Page.SECTIONS -> Page.BOOKS
            Page.MATH -> Page.BOOKS
            Page.BOOKS -> Page.SUBJECTS
            else -> Page.HOME
        }
    }

    fun begin(pool: List<StudyQuestion>, count: Int, name: String) {
        if (pool.isEmpty()) return
        sessionOrigin = page
        session = pool.shuffled().take(count.coerceAtLeast(1))
        sessionTitle = name
        sessionIndex = 0
        chosen = -1
        score = 0
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
            loadError = "Չհաջողվեց բացել շտեմարանը։ " + (e.localizedMessage ?: "")
        }
        loading = false
    }

    BackHandler(page != Page.HOME) { back() }

    val colors = if (dark) darkColorScheme(primary = Color(0xFF1CB4A1))
                 else lightColorScheme(primary = BrandTeal, surface = Color(0xFFF9FBF5))
    val originalDensity = LocalDensity.current
    MaterialTheme(colorScheme = colors) {
        CompositionLocalProvider(LocalDensity provides Density(
            originalDensity.density, originalDensity.fontScale * if (largeText) 1.22f else 1f
        )) {
            Scaffold(
                topBar = {
                    Surface(shadowElevation = 2.dp) {
                        Row(
                            Modifier.fillMaxWidth()
                                .windowInsetsPadding(WindowInsets.statusBars)
                                .height(60.dp).padding(horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (page !in listOf(Page.HOME, Page.SUBJECTS, Page.PROGRESS, Page.SETTINGS, Page.EXAMS, Page.GAMES, Page.TOOLS)) {
                                IconButton(onClick = { back() }) {
                                    Icon(Icons.Default.ArrowBack, contentDescription = "Հետ")
                                }
                            }
                            Text("Shtemarm", fontSize = 23.sp, fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary)
                            Spacer(Modifier.weight(1f))
                            Text("Ուսում", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                        }
                    }
                },
                bottomBar = {
                    NavigationBar {
                        NavigationBarItem(selected = page == Page.HOME, onClick = { page = Page.HOME },
                            icon = { Icon(Icons.Default.Home, contentDescription = null) },
                            label = { Text("Գլխավոր") })
                        NavigationBarItem(selected = page in listOf(Page.SUBJECTS, Page.BOOKS, Page.SECTIONS, Page.STUDY, Page.MATH),
                            onClick = { page = Page.SUBJECTS },
                            icon = { Icon(Icons.Default.Book, contentDescription = null) },
                            label = { Text("Գրքեր") })
                        NavigationBarItem(selected = page == Page.EXAMS, onClick = { page = Page.EXAMS },
                            icon = { Icon(Icons.Default.Star, contentDescription = null) },
                            label = { Text("Թեստեր") })
                        NavigationBarItem(selected = page == Page.GAMES, onClick = { page = Page.GAMES },
                            icon = { Text("★", fontSize = 20.sp) },
                            label = { Text("Խաղեր") })
                        NavigationBarItem(selected = page == Page.TOOLS, onClick = { page = Page.TOOLS },
                            icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                            label = { Text("Գործիքներ") })
                    }
                }
            ) { padding ->
                when (page) {
                    Page.MATH -> NativeMath(if (book?.title?.contains("Մաս 2") == true) 2 else 1)
                    Page.EXAMS -> NativeExams(repository) { selectedSubject, pool, count, name ->
                        subject = selectedSubject
                        begin(pool, count, name)
                    }
                    Page.GAMES -> NativeGames(repository) { selectedSubject, pool, count, name ->
                        subject = selectedSubject
                        begin(pool, count, name)
                    }
                    Page.TOOLS -> NativeTools(repository) { selectedSubject, pool, count, name ->
                        subject = selectedSubject
                        begin(pool, count, name)
                    }
                    Page.HOME -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            Spacer(Modifier.height(10.dp))
                            Text("Սովորի՛ր քո տեմպով", fontSize = 28.sp, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(7.dp))
                            Text("Շտեմարաններ, առաջադրանքներ և վարժանքներ՝ անմիջապես հեռախոսում։",
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        item {
                            Column(
                                Modifier.fillMaxWidth()
                                    .background(
                                        Brush.linearGradient(listOf(Color(0xFF103D44), Color(0xFF147C70))),
                                        RoundedCornerShape(23.dp)
                                    ).padding(23.dp)
                            ) {
                                Text("ՍՈՎՈՐԻՐ SHTEMARM-ՈՎ", fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold, color = Color(0xFFB9F5E7))
                                Spacer(Modifier.height(14.dp))
                                Text("Պատրա՞ստ ես սովորելու", fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold, color = Color.White)
                                Spacer(Modifier.height(8.dp))
                                Text("Առկա հարցերը պահպանված են հավելվածում և հասանելի են նաև առանց ինտերնետի։",
                                    color = Color(0xFFDCF5F0))
                                Spacer(Modifier.height(15.dp))
                                Button(onClick = { page = Page.SUBJECTS }) { Text("Բացել շտեմարանները") }
                            }
                        }
                        item {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(onClick = { page = Page.EXAMS }, modifier = Modifier.weight(1f)) {
                                    Text("Թեստեր")
                                }
                                OutlinedButton(onClick = { page = Page.GAMES }, modifier = Modifier.weight(1f)) {
                                    Text("Խաղեր")
                                }
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                TextButton(onClick = { page = Page.PROGRESS }, modifier = Modifier.weight(1f)) {
                                    Text("Առաջընթաց")
                                }
                                TextButton(onClick = { page = Page.SETTINGS }, modifier = Modifier.weight(1f)) {
                                    Text("Կարգավորումներ")
                                }
                            }
                        }
                        item { Text("Արագ մեկնարկ", fontSize = 21.sp, fontWeight = FontWeight.SemiBold) }
                        items(BookCatalog.subjects.take(5)) { s ->
                            SubjectCard(s) { subject = s; page = Page.BOOKS }
                        }
                        item {
                            OutlinedButton(onClick = { page = Page.SUBJECTS },
                                modifier = Modifier.fillMaxWidth()) { Text("Տեսնել բոլոր առարկաները") }
                        }
                    }
                    Page.SUBJECTS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        item { ScreenHeading("Առարկաներ", "Ընտրիր առարկան և շարունակիր վարժանքը։") }
                        items(BookCatalog.subjects) { s ->
                            SubjectCard(s) { subject = s; page = Page.BOOKS }
                        }
                        item {
                            Text("Մաթեմատիկայի հասանելի տեքստային հարցերը դեռ չունեն ստուգված պատասխաններ։ Կենսաբանության 3-րդ և 4-րդ գրքերի ստուգված բանկերն առկա չեն։",
                                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                        }
                    }
                    Page.BOOKS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item { ScreenHeading(subject, "Ընտրիր շտեմարան կամ թեստերի հավաքածու։") }
                        items(BookCatalog.books.filter { it.subject == subject }) { item ->
                            ElevatedCard(
                                modifier = Modifier.fillMaxWidth().clickable {
                                    book = item
                                    page = if (item.subject == "Մաթեմատիկա") Page.MATH else Page.SECTIONS
                                },
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Column(Modifier.fillMaxWidth().padding(18.dp)) {
                                    Text(item.title, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                                    Text("Անցանց հարցաշար", fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                    Page.SECTIONS -> LazyColumn(
                        Modifier.fillMaxSize().padding(padding).padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(11.dp)
                    ) {
                        item { ScreenHeading(book?.title ?: "Շտեմարան", subject) }
                        if (loading) item {
                            LinearProgressIndicator(Modifier.fillMaxWidth())
                            Text("Բացվում է…")
                        } else if (loadError.isNotBlank()) item {
                            Text(loadError, color = MaterialTheme.colorScheme.error)
                        } else {
                            val data = loaded
                            if (data == null || data.allQuestions.isEmpty()) item {
                                Text("Այս շտեմարանում դեռ չկան ամբողջությամբ պատասխանված, ցուցադրվող բազմընտրանի հարցեր։")
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
                                    Text("Պատահական թեստերը պաշտոնական քննության կառուցվածքը չեն կրկնում։",
                                        color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                                }
                                item { Text("Բաժիններ", fontWeight = FontWeight.Bold, fontSize = 21.sp) }
                                items(data.sections) { sec ->
                                    ElevatedCard(
                                        Modifier.fillMaxWidth().clickable { begin(sec.questions, sec.questions.size, sec.title) },
                                        shape = RoundedCornerShape(15.dp)
                                    ) {
                                        Column(Modifier.padding(17.dp)) {
                                            Text(sec.title, fontWeight = FontWeight.SemiBold)
                                            Text(sec.questions.size.toString() + " հարց", fontSize = 13.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                    }
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
                                            Text(q.passage, fontSize = 15.sp, lineHeight = 24.sp)
                                        }
                                    }
                                }
                                item {
                                    Text(q.stem, fontSize = 19.sp, lineHeight = 28.sp,
                                        fontWeight = FontWeight.SemiBold)
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
                                                if (n == q.correctIndex) score++
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
                        Text("Վարժանքն ավարտված է", fontSize = 26.sp, fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center)
                        Spacer(Modifier.height(24.dp))
                        Text(score.toString() + " / " + session.size,
                            fontSize = 40.sp, fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary)
                        Text("Ճիշտ պատասխան", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(26.dp))
                        Button(onClick = { begin(session, session.size, sessionTitle) },
                            modifier = Modifier.fillMaxWidth()) { Text("Կրկնել վարժանքը") }
                        OutlinedButton(onClick = { page = Page.PROGRESS },
                            modifier = Modifier.fillMaxWidth()) { Text("Իմ առաջընթացը") }
                        TextButton(onClick = { page = sessionOrigin }) { Text("Վերադառնալ") }
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
                                        Text("Ճշտություն՝ " + stats.accuracy + "%", fontSize = 13.sp)
                                    }
                                }
                            }
                        }
                    }
                    Page.SETTINGS -> Column(
                        Modifier.fillMaxSize().padding(padding).padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        ScreenHeading("Կարգավորումներ", "Հարմարեցրու Shtemarm-ը քեզ համար։")
                        SettingToggle("Մուգ թեմա", dark) { dark = it; progress.darkMode = it }
                        SettingToggle("Խոշոր տեքստ", largeText) {
                            largeText = it; progress.largeText = it
                        }
                        SettingToggle("Ցույց տալ ճիշտ պատասխանը", immediateFeedback) {
                            immediateFeedback = it; progress.showAnswersImmediately = it
                        }
                        HorizontalDivider()
                        Text("Հավելվածի տարբերակ՝ 0.2.0 · Native Android")
                        Text("Հարցաշարերն աշխատում են առանց ինտերնետի։ Այս տարբերակում հաշվի համաժամեցում դեռ չկա։",
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
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
