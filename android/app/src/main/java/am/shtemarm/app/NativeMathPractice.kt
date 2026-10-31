package am.shtemarm.app

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

private object VerifiedMathCache {
    // The two official book parts are large; parse each at most once per process.
    private val byPart = mutableMapOf<Int, LoadedBook>()
    fun get(part: Int): LoadedBook? = synchronized(byPart) { byPart[part] }
    fun put(part: Int, book: LoadedBook) { synchronized(byPart) { byPart[part] = book } }
}

/**
 * Mirrors src/lib/math-bank.ts mergeMathQuestions on native Android.
 * Scores ONLY source-verified, complete multiple-choice questions.
 * Missing transcription or answer keys are never guessed.
 */
internal suspend fun loadScoredMath(context: Context, part: Int): LoadedBook =
    withContext(Dispatchers.IO) {
        VerifiedMathCache.get(part)?.let { return@withContext it }
        val index = context.assets.open("math-books-index.json").bufferedReader(Charsets.UTF_8)
            .use { JSONObject(it.readText()) }
        val textBank = context.assets.open("math-text-questions.json").bufferedReader(Charsets.UTF_8)
            .use { JSONObject(it.readText()) }
        val extraBank = context.assets.open("math-text-questions-extra.json").bufferedReader(Charsets.UTF_8)
            .use { JSONObject(it.readText()) }
        val bookId = "matem-$part"
        val book = index.optJSONObject("books")?.optJSONObject(bookId)
            ?: return@withContext LoadedBook(emptyList())
        val source = textBank.optJSONObject(bookId)
        val extraSource = extraBank.optJSONObject(bookId)
        val sections = book.optJSONArray("sections") ?: return@withContext LoadedBook(emptyList())
        val result = mutableListOf<StudySection>()

        for (s in 0 until sections.length()) {
            val section = sections.optJSONObject(s) ?: continue
            val chapter = section.optInt("chapter")
            val sectionNum = section.optInt("section")
            val sourceSection = source?.optJSONObject("$chapter-$sectionNum")
            val extraSection = extraSource?.optJSONObject("$chapter-$sectionNum")
            val tasks = section.optJSONArray("tasks") ?: continue
            val verified = mutableListOf<StudyQuestion>()
            for (t in 0 until tasks.length()) {
                val task = tasks.optJSONObject(t) ?: continue
                val kind = task.optString("answer_type", "choice")
                if (kind != "choice") continue
                val taskNum = task.optInt("task")
                val answers = task.optJSONArray("answers") ?: continue
                val transcription = sourceSection?.optJSONArray(taskNum.toString())
                val extras = extraSection?.optJSONArray(taskNum.toString())
                val previous = task.optJSONArray("questions")
                val count = task.optInt("sub_count", answers.length()).coerceAtMost(answers.length())
                for (qIndex in 0 until count) {
                    val correct = answers.optString(qIndex).toIntOrNull()?.minus(1) ?: continue
                    // Extra transcriptions fill gaps but the book's indexed answer
                    // key is still mandatory. Incomplete candidates are skipped.
                    val candidates = listOf(
                        extras?.optJSONObject(qIndex),
                        transcription?.optJSONObject(qIndex),
                        previous?.optJSONObject(qIndex)
                    )
                    for (q in candidates) {
                        if (q == null) continue
                        val stem = q.optString("prompt").trim()
                        if (stem.isBlank() ||
                            stem.contains("still being processed", ignoreCase = true) ||
                            stem.contains("<img", ignoreCase = true)) continue
                        val choicesArray = q.optJSONArray("options") ?: continue
                        if (choicesArray.length() !in 2..6) continue
                        val choices = (0 until choicesArray.length()).map {
                            choicesArray.optString(it).trim()
                        }
                        if (choices.any { it.isBlank() } || choices.distinct().size != choices.size ||
                            correct !in choices.indices) continue
                        verified.add(
                            StudyQuestion(
                                id = "math:$bookId:$chapter:$sectionNum:$taskNum:" + (qIndex + 1),
                                stem = stem,
                                choices = choices,
                                correctIndex = correct
                            )
                        )
                        break
                    }
                }
            }
            if (verified.isNotEmpty()) {
                val title = section.optString("title").trim()
                result.add(
                    StudySection(
                        "Գլուխ $chapter · Բաժին $sectionNum" +
                            if (title.isNotBlank()) " · $title" else "",
                        verified
                    )
                )
            }
        }
        LoadedBook(result).also { VerifiedMathCache.put(part, it) }
    }

@Composable
fun NativeMathPractice(
    bookPart: Int,
    onStart: (List<StudyQuestion>, Int, String) -> Unit
) {
    val context = LocalContext.current.applicationContext
    var book by remember(bookPart) { mutableStateOf<LoadedBook?>(null) }
    var loading by remember(bookPart) { mutableStateOf(true) }
    var error by remember(bookPart) { mutableStateOf("") }
    var showUnscoredReader by remember(bookPart) { mutableStateOf(false) }
    var chapterQuery by remember(bookPart) { mutableStateOf("") }

    LaunchedEffect(bookPart) {
        loading = true
        error = ""
        book = try {
            loadScoredMath(context, bookPart)
        } catch (_: Exception) {
            error = "Հնարավոր չեղավ բացել մաթեմատիկայի թվայնացված հարցերը։"
            LoadedBook(emptyList())
        }
        loading = false
    }

    if (showUnscoredReader) {
        Column(Modifier.fillMaxSize()) {
            TextButton(onClick = { showUnscoredReader = false }) { Text("‹ Վերադառնալ գրքին") }
            Box(Modifier.weight(1f)) { NativeMath(bookPart) }
        }
        return
    }

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Spacer(Modifier.height(7.dp))
            AcademyEyebrow("Մաթեմատիկայի շտեմարան")
            Spacer(Modifier.height(8.dp))
            AcademySectionTitle("Մաթեմատիկա · Մաս $bookPart")
            Spacer(Modifier.height(7.dp))
            Text("Սովորիր բաժիններով և լուծիր ստուգված բազմընտրանի առաջադրանքները։",
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
        }
        item {
            OutlinedButton(
                onClick = { showUnscoredReader = true },
                modifier = Modifier.fillMaxWidth()
            ) { Text("Բացել թվայնացված առաջադրանքների ընթերցիչը") }
        }
        if (loading) {
            item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
        } else {
            if (error.isNotBlank()) item {
                Text(error, color = MaterialTheme.colorScheme.error)
            }
            val sections = book?.sections.orEmpty()
            val all = book?.allQuestions.orEmpty()
            item {
                Text("Ստուգված հարցեր՝ ${all.size}", fontWeight = FontWeight.Bold)
                Text("Չստուգված կամ միայն նկարներով առաջադրանքները բաց թողնված են։",
                    color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            if (all.isNotEmpty()) {
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(onClick = { onStart(all, minOf(10, all.size), "Մաթեմատիկա · Արագ վարժանք") },
                            modifier = Modifier.weight(1f)) { Text("10 հարց") }
                        OutlinedButton(
                            onClick = { onStart(all, minOf(65, all.size), "65 հարցանոց ուսումնական թեստ") },
                            modifier = Modifier.weight(1f)
                        ) { Text("Մինչև 65 հարց") }
                    }
                    Text("Ուսումնական թեստը ԳԹԿ քննության պաշտոնական կառուցվածքը չի կրկնում։",
                        color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                }
                item {
                    OutlinedTextField(
                        value = chapterQuery,
                        onValueChange = { chapterQuery = it.take(100) },
                        label = { Text("Փնտրել մաթեմատիկայի բաժին") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                val visible = sections.indices.filter { index ->
                    BookStudyHelpers.matches(chapterQuery, sections[index].title)
                }
                if (visible.isEmpty()) item {
                    Text("Այս անվանումով բաժին չգտնվեց։",
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                items(visible.size) { visibleIndex ->
                    val index = visible[visibleIndex]
                    val section = sections[index]
                    AcademyBookSectionCard(
                        index = index + 1,
                        title = section.title,
                        count = section.questions.size,
                        onPlay = {
                            onStart(section.questions, minOf(10, section.questions.size), section.title + " · Խաղ")
                        },
                        onClassic = {
                            onStart(section.questions, section.questions.size, section.title)
                        },
                        onTest = {
                            onStart(section.questions, minOf(30, section.questions.size), section.title + " · Թեստ")
                        }
                    )
                }
            } else if (error.isEmpty()) item {
                Text("Այս մասի ստուգված տեքստային բազմընտրանի հարցերը դեռ հասանելի չեն։")
            }
        }
        item { Spacer(Modifier.height(10.dp)) }
    }
}
