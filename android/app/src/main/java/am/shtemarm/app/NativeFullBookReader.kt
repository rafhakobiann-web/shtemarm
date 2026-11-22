package am.shtemarm.app

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import kotlin.coroutines.coroutineContext

internal data class SourceExercise(
    val id: String,
    val heading: String,
    val kind: String,
    val passage: String,
    val prompt: String,
    val options: List<String>,
    val answer: String,
    val visual: String
)

private object SourceExerciseCache {
    private val books = object : LinkedHashMap<String, List<SourceExercise>>(3, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, List<SourceExercise>>?): Boolean =
            size > 2
    }
    fun get(key: String): List<SourceExercise>? = synchronized(books) { books[key] }
    fun put(key: String, value: List<SourceExercise>) { synchronized(books) { books[key] = value } }
}

internal suspend fun loadSourceExercises(context: Context, book: StudyBook): List<SourceExercise> {
    val cacheKey = listOf(book.subject, book.title, book.asset).joinToString(":")
    SourceExerciseCache.get(cacheKey)?.let { return it }

    val rawSources = withContext(Dispatchers.IO) {
        if (book.subject == "Մաթեմատիկա") {
            val index = context.assets.open("math-books-index.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
            val questions = context.assets.open("math-text-questions.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
            listOf(book.asset to (index + "\n<<<SHTEMARM-MATH-SOURCE>>>\n" + questions))
        } else {
            sourceAssetNames(book).map { asset ->
                asset to context.assets.open(asset).bufferedReader(Charsets.UTF_8).use { it.readText() }
            }
        }
    }

    val parsed = withContext(Dispatchers.Default) {
        coroutineContext.ensureActive()
        if (book.subject == "Մաթեմատիկա") {
            parseMathSource(rawSources.single().second, if (book.title.contains("Մաս 2")) 2 else 1)
        } else if (book.subject == "Կենսաբանություն" &&
            book.asset in setOf("bio-book3.json", "bio-book4.json")) {
            parseBiologySources(rawSources)
        } else {
            rawSources.flatMap { (asset, source) ->
                parseSourceJson(book.copy(asset = asset), source)
            }
        }
    }
    SourceExerciseCache.put(cacheKey, parsed)
    return parsed
}

private fun sourceAssetNames(book: StudyBook): List<String> {
    if (book.subject == "Կենսաբանություն" && book.asset in setOf("bio-book3.json", "bio-book4.json")) {
        val part = if (book.asset.endsWith("3.json")) 3 else 4
        return listOf(
            book.asset,
            "biology-extended-book$part.json",
            "biology-pending-book$part.json",
            "biology-last61-book$part.json"
        )
    }
    if (book.subject == "Հայոց լեզու" && book.asset == "armenian-book1.json") {
        return listOf(book.asset) +
            (1..8).map { "armenian-official-1-section$it.json" } +
            "armenian-official-1-assertions.json"
    }
    return listOf(book.asset)
}

private fun parseBiologySources(sources: List<Pair<String, String>>): List<SourceExercise> {
    val bySection = sortedMapOf<Int, MutableList<Triple<String, String, JSONObject>>>()
    for ((asset, raw) in sources) {
        val sections = JSONObject(raw).optJSONArray("sections") ?: continue
        for (si in 0 until sections.length()) {
            val section = sections.optJSONObject(si) ?: continue
            val number = section.optInt("n", si + 1)
            val title = section.optString("title").ifBlank {
                section.optString("label").ifBlank { "Բաժին $number" }
            }
            val units = section.optJSONArray("units") ?: continue
            val target = bySection.getOrPut(number) { mutableListOf() }
            for (ui in 0 until units.length()) {
                val unit = units.optJSONObject(ui) ?: continue
                target.add(Triple(asset, title, unit))
            }
        }
    }

    val output = ArrayList<SourceExercise>()
    for ((_, rows) in bySection) {
        // Match the website's merged book ordering: section number first,
        // then printed task label, with original source order retained for ties.
        rows.sortBy { it.third.optString("label").toDoubleOrNull() ?: Double.POSITIVE_INFINITY }
        for ((index, row) in rows.withIndex()) {
            appendUnit(output, row.first, row.second, row.third.optString("label"), index, row.third)
        }
    }
    return output
}

private fun parseSourceJson(book: StudyBook, raw: String): List<SourceExercise> {
    val root = JSONObject(raw)
    val result = ArrayList<SourceExercise>()
    val sections = root.optJSONArray("sections")
    if (sections != null) {
        for (si in 0 until sections.length()) {
            val section = sections.optJSONObject(si) ?: continue
            val sectionTitle = section.optString("title").ifBlank {
                section.optString("label").ifBlank { "Բաժին ${si + 1}" }
            }
            val units = section.optJSONArray("units") ?: continue
            for (ui in 0 until units.length()) {
                val unit = units.optJSONObject(ui) ?: continue
                appendUnit(result, book.asset, sectionTitle, unit.optString("label"), ui, unit)
            }
        }
    }

    val tests = root.optJSONArray("tests")
    if (tests != null) {
        for (ti in 0 until tests.length()) {
            val test = tests.optJSONObject(ti) ?: continue
            val title = test.optString("title").ifBlank { "Թեստ ${test.optInt("id", ti + 1)}" }
            val tasks = test.optJSONArray("tasks") ?: continue
            for (ui in 0 until tasks.length()) {
                val unit = tasks.optJSONObject(ui) ?: continue
                appendUnit(result, book.asset, title, unit.optString("label"), ui, unit)
            }
        }
    }

    val officialMc = root.optJSONArray("mc")
    if (officialMc != null) {
        val sectionTitle = root.optString("title").ifBlank { "Բնօրինակ հարցեր" }
        for (i in 0 until officialMc.length()) {
            val q = officialMc.optJSONObject(i) ?: continue
            val options = q.opt("options")
            val answer = displayAnswer(q.opt("answer"), options)
            val prompt = q.optString("stem").trim()
            val page = q.optString("pdfPage").takeIf { it.isNotBlank() }?.let { " · էջ $it" }.orEmpty()
            val review = q.optBoolean("reviewRequired")
            if (prompt.isNotBlank()) result.add(SourceExercise(
                "${book.asset}:official:${q.optString("n", i.toString())}",
                "$sectionTitle · հարց ${q.optString("n", (i + 1).toString())}$page",
                if (review) "mc · ստուգման ենթակա" else "mc · բնօրինակ",
                "", prompt, stringOptions(options), answer, visualReference(q)
            ))
        }
    }

    val shortQuestions = root.optJSONArray("short")
    if (shortQuestions != null) {
        val sectionTitle = root.optString("title").ifBlank { "Կարճ պատասխանով հարցեր" }
        for (i in 0 until shortQuestions.length()) {
            val q = shortQuestions.optJSONObject(i) ?: continue
            val prompt = q.optString("stem").trim()
            if (prompt.isNotBlank()) result.add(SourceExercise(
                "${book.asset}:short:${q.optString("n", i.toString())}",
                "$sectionTitle · հարց ${q.optString("n", (i + 1).toString())}",
                "short", "", prompt, emptyList(), q.optString("answer").trim(), ""
            ))
        }
    }

    val groups = root.optJSONArray("groups")
    if (groups != null) {
        val sectionTitle = root.optString("name").ifBlank { "Պնդումներ" }
        for (gi in 0 until groups.length()) {
            val group = groups.optJSONObject(gi) ?: continue
            val rows = group.optJSONArray("questions") ?: continue
            for (qi in 0 until rows.length()) {
                val q = rows.optJSONObject(qi) ?: continue
                val prompt = q.optString("stem").trim()
                if (prompt.isNotBlank()) result.add(SourceExercise(
                    "${book.asset}:group:${gi + 1}:$qi",
                    "$sectionTitle · խումբ ${group.optString("n", (gi + 1).toString())} · հարց ${q.optString("n", (qi + 1).toString())}",
                    "assertion", root.optString("instruction"), prompt,
                    stringOptions(q.opt("options")), displayAnswer(q.opt("answer"), q.opt("options")), visualReference(q)
                ))
            }
        }
    }

    if (sections == null && tests == null && officialMc == null && shortQuestions == null && groups == null) {
        val flat = root.optJSONArray("questions") ?: root.optJSONArray("items")
        if (flat != null) {
            for (i in 0 until flat.length()) {
                val q = flat.optJSONObject(i) ?: continue
                val prompt = q.optString("stem").ifBlank { q.optString("prompt") }.trim()
                val options = stringOptions(q.opt("options"))
                val answer = displayAnswer(q.opt("answer"), q.opt("options"))
                val visual = visualReference(q)
                if (prompt.isBlank() && visual.isBlank()) continue
                result.add(SourceExercise(
                    "${book.asset}:flat:$i", q.optString("section").ifBlank { "Հարց ${i + 1}" },
                    q.optString("kind", "Հարց"), "", prompt, options, answer, visual
                ))
            }
        }
    }
    return result
}

private fun appendUnit(
    output: MutableList<SourceExercise>,
    source: String,
    section: String,
    label: String,
    unitIndex: Int,
    unit: JSONObject
) {
    val passage = unit.optString("passage").trim()
    val unitLabel = label.ifBlank { unit.optString("id").ifBlank { "Առաջադրանք ${unitIndex + 1}" } }
    val kind = unit.optString("kind").ifBlank { "Առաջադրանք" }
    val visual = visualReference(unit)
    val questions = unit.optJSONArray("questions")
    if (questions != null && questions.length() > 0) {
        for (qi in 0 until questions.length()) {
            val q = questions.optJSONObject(qi) ?: continue
            val prompt = q.optString("stem").ifBlank { q.optString("prompt") }.trim()
            val optionsValue = q.opt("options") ?: unit.opt("options")
            val answerValue = if (q.has("answer")) q.opt("answer") else unit.opt("answer")
            val qVisual = visualReference(q).ifBlank { visual }
            if (prompt.isBlank() && passage.isBlank() && qVisual.isBlank()) continue
            val number = q.optString("n").ifBlank { (qi + 1).toString() }
            output.add(SourceExercise(
                "$source:${unit.optString("id").ifBlank { unitIndex.toString() }}:$qi", "$section · $unitLabel · $number",
                q.optString("kind").ifBlank { kind }, passage, prompt,
                stringOptions(optionsValue), displayAnswer(answerValue, optionsValue), qVisual
            ))
        }
        return
    }

    val prompt = listOf("prompt", "stem", "instruction", "text")
        .map { unit.optString(it).trim() }.firstOrNull { it.isNotBlank() }.orEmpty()
    if (passage.isNotBlank() || prompt.isNotBlank() || visual.isNotBlank()) {
        output.add(SourceExercise(
            "$source:${unit.optString("id").ifBlank { unitIndex.toString() }}", "$section · $unitLabel", kind, passage,
            prompt, stringOptions(unit.opt("options")), displayAnswer(unit.opt("answer"), unit.opt("options")), visual
        ))
    }
}

private fun parseMathSource(raw: String, part: Int): List<SourceExercise> {
    val marker = "\n<<<SHTEMARM-MATH-SOURCE>>>\n"
    val split = raw.indexOf(marker)
    require(split > 0) { "Math source files are unavailable" }
    val index = JSONObject(raw.substring(0, split))
    val textBank = JSONObject(raw.substring(split + marker.length))
    val bookId = "matem-$part"
    val book = index.optJSONObject("books")?.optJSONObject(bookId) ?: return emptyList()
    val source = textBank.optJSONObject(bookId)
    val sections = book.optJSONArray("sections") ?: return emptyList()
    val result = ArrayList<SourceExercise>()

    for (si in 0 until sections.length()) {
        val section = sections.optJSONObject(si) ?: continue
        val chapter = section.optInt("chapter")
        val sectionNumber = section.optInt("section")
        val heading = "Գլուխ $chapter · Բաժին $sectionNumber " + section.optString("title")
        val sourceSection = source?.optJSONObject("$chapter-$sectionNumber")
        val tasks = section.optJSONArray("tasks") ?: continue
        for (ti in 0 until tasks.length()) {
            val task = tasks.optJSONObject(ti) ?: continue
            val taskNumber = task.optInt("task")
            val answers = task.optJSONArray("answers")
            val rows = sourceSection?.optJSONArray(taskNumber.toString())
            val fallbackRows = task.optJSONArray("questions")
            val count = task.optInt("sub_count", answers?.length() ?: 0)
                .coerceAtMost(maxOf(rows?.length() ?: 0, fallbackRows?.length() ?: 0, answers?.length() ?: 0))
            for (qi in 0 until count) {
                val q = rows?.optJSONObject(qi) ?: fallbackRows?.optJSONObject(qi)
                val prompt = q?.optString("prompt").orEmpty().trim()
                val passage = q?.optString("passage").orEmpty().trim()
                val options = stringOptions(q?.opt("options"))
                val answer = answers?.opt(qi)?.toString().orEmpty().takeUnless { it == "null" }.orEmpty()
                val visual = q?.let(::visualReference).orEmpty()
                if (prompt.isBlank() && passage.isBlank() && visual.isBlank()) continue
                result.add(SourceExercise(
                    "math:$bookId:$chapter:$sectionNumber:$taskNumber:${qi + 1}",
                    "$heading · Առաջադրանք $taskNumber · ${qi + 1}",
                    task.optString("answer_type", "choice"), passage, prompt, options, answer, visual
                ))
            }
        }
    }
    return result
}

private fun stringOptions(value: Any?): List<String> = when (value) {
    is JSONObject -> {
        val keys = listOf("a", "b", "c", "d", "e", "f", "1", "2", "3", "4", "5", "6")
            .filter { value.has(it) }
        val ordered = if (keys.isNotEmpty()) keys else value.keys().asSequence().toList().sorted()
        ordered.map { value.optString(it).trim() }.filter { it.isNotBlank() }
    }
    is JSONArray -> (0 until value.length()).map { value.optString(it).trim() }.filter { it.isNotBlank() }
    else -> emptyList()
}

private fun displayAnswer(value: Any?, optionsValue: Any?): String {
    if (value == null || value == JSONObject.NULL) return ""
    val raw = when (value) {
        is JSONArray -> (0 until value.length()).joinToString(", ") { value.optString(it) }
        is JSONObject -> value.keys().asSequence().sorted().joinToString(", ") {
            "$it → ${value.optString(it)}"
        }
        else -> value.toString()
    }.trim()
    if (raw.isBlank()) return ""
    val options = optionsValue as? JSONObject ?: return raw
    val optionText = options.optString(raw).trim()
    return if (optionText.isNotBlank()) "$raw · $optionText" else raw
}

private fun visualReference(value: JSONObject): String {
    val keys = listOf("image", "diagram", "figure", "imageUrl", "illustration")
    if (value.has("diagramOptions")) return "Գծապատկերի տարբերակներ կան սկզբնաղբյուրում"
    return keys.firstNotNullOfOrNull { key ->
        if (value.has(key) && !value.isNull(key)) value.optString(key).trim().takeIf { it.isNotBlank() }
        else null
    }.orEmpty()
}

@Composable
fun NativeFullBookReader(book: StudyBook, onBack: () -> Unit, showBack: Boolean = true) {
    val context = LocalContext.current.applicationContext
    val progress = remember { StudyProgress(context) }
    var exercises by remember(book) { mutableStateOf<List<SourceExercise>>(emptyList()) }
    var loading by remember(book) { mutableStateOf(true) }
    var error by remember(book) { mutableStateOf("") }
    var query by rememberSaveable(book.asset, book.title) { mutableStateOf("") }
    var revealAnswers by rememberSaveable(book.asset, book.title) { mutableStateOf(false) }
    var textSize by rememberSaveable(book.asset, book.title) {
        mutableIntStateOf(progress.readingTextSize)
    }

    LaunchedEffect(book) {
        loading = true
        error = ""
        try {
            exercises = loadSourceExercises(context, book)
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            error = NativeStudyGuide.label(
                progress.studyLanguage,
                "Չհաջողվեց բացել գրքի ամբողջական տեքստը։",
                "Could not open the complete book text.",
                "Не удалось открыть полный текст книги."
            )
        } finally {
            loading = false
        }
    }

    val visible = remember(exercises, query) {
        if (query.isBlank()) exercises
        else exercises.filter {
            BookStudyHelpers.matches(query, it.heading, it.prompt, it.passage, it.options.joinToString(" "))
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            if (showBack) TextButton(onClick = onBack) {
                Text(NativeStudyGuide.label(progress.studyLanguage, "‹ Վերադառնալ գրքին", "‹ Back to book", "‹ К книге"))
            }
            Text(book.subject, color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
            Text(book.title, style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold)
            Text(
                if (loading)
                    NativeStudyGuide.label(progress.studyLanguage,
                        "Բեռնվում են գրքի հարցերը…",
                        "Loading book questions…",
                        "Загружаются задания…")
                else NativeStudyGuide.label(progress.studyLanguage,
                    "Ամբողջ հասանելի հարցաշարը · ${exercises.size} առաջադրանք",
                    "All available source questions · ${exercises.size} exercises",
                    "Все доступные задания · ${exercises.size}"),
                color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp
            )
        }
        if (loading) {
            item {
                LinearProgressIndicator(Modifier.fillMaxWidth())
                Text(NativeStudyGuide.label(progress.studyLanguage, "Բացում ենք գրքի հարցերը…", "Opening book questions…", "Открываем задания…"),
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                repeat(3) {
                    ElevatedCard(Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp)) {
                        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                            Text("•••", color = MaterialTheme.colorScheme.outline)
                            LinearProgressIndicator(Modifier.fillMaxWidth())
                        }
                    }
                }
            }
        } else if (error.isNotBlank()) {
            item { Text(error, color = MaterialTheme.colorScheme.error) }
        } else if (exercises.isEmpty()) {
            item {
                Text(NativeStudyGuide.label(progress.studyLanguage,
                    "Այս գրքի ընթեռնելի հարցերի աղբյուր դեռ չկա։",
                    "No readable question source is available for this book yet.",
                    "Для этой книги пока нет доступного текста заданий."))
            }
        } else {
            item {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it.take(100) },
                    label = { Text(NativeStudyGuide.label(progress.studyLanguage, "Փնտրել հարցերի մեջ", "Search questions", "Поиск заданий")) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp)
                )
            }
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Row(Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                        TextButton(onClick = { textSize = ReaderTypography.decrease(textSize); progress.readingTextSize = textSize },
                            enabled = textSize > ReaderTypography.MIN_TEXT_SIZE_SP) { Text("A−") }
                        Text("${textSize}sp", style = MaterialTheme.typography.labelMedium)
                        TextButton(onClick = { textSize = ReaderTypography.increase(textSize); progress.readingTextSize = textSize },
                            enabled = textSize < ReaderTypography.MAX_TEXT_SIZE_SP) { Text("A+") }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = revealAnswers, onCheckedChange = { revealAnswers = it })
                        Text(NativeStudyGuide.label(progress.studyLanguage, "Պատասխանները", "Answers", "Ответы"),
                            style = MaterialTheme.typography.labelMedium)
                    }
                }
                Text(NativeStudyGuide.label(progress.studyLanguage,
                    "Ընթերցման ռեժիմ է․ չստուգված առաջադրանքները չեն գնահատվում։",
                    "Reading mode. Unverified items are not scored.",
                    "Режим чтения: непроверенные задания не оцениваются."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            if (visible.isEmpty()) item {
                Text(NativeStudyGuide.label(progress.studyLanguage, "Համընկնում չգտնվեց։", "No matching questions.", "Совпадений нет."))
            }
            items(visible, key = { it.id }) { exercise ->
                ElevatedCard(Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
                    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                        Text(exercise.heading, color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                        Text(exercise.kind.uppercase(), color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        SelectionContainer {
                            Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                                if (exercise.passage.isNotBlank()) {
                                    Text(exercise.passage, fontSize = textSize.sp,
                                        lineHeight = (textSize * 1.65f).sp)
                                }
                                if (exercise.prompt.isNotBlank()) {
                                    Text(exercise.prompt, fontSize = textSize.sp,
                                        lineHeight = (textSize * 1.65f).sp,
                                        fontWeight = FontWeight.Medium)
                                }
                                exercise.options.forEachIndexed { index, option ->
                                    Text("${('A'.code + index).toChar()}. $option",
                                        fontSize = (textSize - 1).coerceAtLeast(13).sp,
                                        lineHeight = (textSize * 1.45f).sp)
                                }
                                if (exercise.visual.isNotBlank()) {
                                    Text(
                                        NativeStudyGuide.label(progress.studyLanguage,
                                            "Գրքում կա պատկեր կամ գծագիր՝ ${exercise.visual}",
                                            "The source question includes a figure: ${exercise.visual}",
                                            "В исходном задании есть изображение: ${exercise.visual}"),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                        if (revealAnswers) {
                            HorizontalDivider()
                            Text(
                                if (exercise.answer.isBlank())
                                    NativeStudyGuide.label(progress.studyLanguage,
                                        "Աղբյուրում պատասխան նշված չէ։", "No answer is marked in the source.", "В источнике ответ не указан.")
                                else NativeStudyGuide.label(progress.studyLanguage,
                                    "Աղբյուրի պատասխան՝ ${exercise.answer}",
                                    "Source answer: ${exercise.answer}",
                                    "Ответ из источника: ${exercise.answer}"),
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
            item { Spacer(Modifier.height(12.dp)) }
        }
    }
}