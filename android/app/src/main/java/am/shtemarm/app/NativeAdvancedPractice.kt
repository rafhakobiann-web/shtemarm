package am.shtemarm.app

import android.content.Context
import java.util.UUID
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.ensureActive
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.abs

private data class AdvancedTask(
    val id: String,
    val type: String,
    val title: String,
    val prompt: String,
    val answer: List<String> = emptyList(),
    val mapping: Map<String, String> = emptyMap(),
    val expected: String = "",
    val count: Int = 0
)

private suspend fun loadAdvanced(context: Context, book: StudyBook): List<AdvancedTask> =
    withContext(Dispatchers.IO) {
        ensureActive()
        val json = context.assets.open(book.asset).bufferedReader(Charsets.UTF_8)
            .use { JSONObject(it.readText()) }
        val result = mutableListOf<AdvancedTask>()
        val sections = json.optJSONArray("sections") ?: return@withContext result
        for (si in 0 until sections.length()) {
            ensureActive()
            val section = sections.optJSONObject(si) ?: continue
            val units = section.optJSONArray("units") ?: continue
            for (ui in 0 until units.length()) {
                ensureActive()
                val unit = units.optJSONObject(ui) ?: continue
                if (listOf("image", "diagram", "figure").any { unit.has(it) &&
                        !unit.isNull(it) && unit.optString(it).isNotBlank() }) continue
                val kind = unit.optString("kind")
                val prompt = unit.optString("passage").trim()
                val title = unit.optString("label").ifBlank { "Բաժին " + (si + 1) }
                val id = book.asset + ":" + si + ":" + ui
                when (kind) {
                    "set", "seq" -> {
                        val a = unit.optJSONArray("answer") ?: continue
                        val answer = (0 until a.length()).mapNotNull { i ->
                            a.opt(i)?.toString()?.takeIf { it.isNotBlank() }
                        }
                        if (answer.isEmpty() || prompt.isBlank()) continue
                        val maxAnswer = answer.mapNotNull { it.toIntOrNull() }.maxOrNull() ?: 6
                        val numbered = Regex("(?m)(?:^|\\n)\\s*(\\d{1,2})[.)]")
                            .findAll(prompt).mapNotNull { it.groupValues[1].toIntOrNull() }
                            .filter { it in 1..20 }.maxOrNull() ?: 0
                        result.add(
                            AdvancedTask(
                                id, kind, title, prompt, answer,
                                count = maxOf(unit.optInt("count", 0), maxAnswer, numbered)
                                    .coerceIn(2, 20)
                            )
                        )
                    }
                    "match" -> {
                        val jsonAnswer = unit.optJSONObject("answer") ?: continue
                        val mapping = mutableMapOf<String, String>()
                        for (key in jsonAnswer.keys()) {
                            val value = jsonAnswer.optString(key)
                            if (key.isNotBlank() && value.isNotBlank())
                                mapping[key] = value
                        }
                        if (mapping.isNotEmpty() && prompt.isNotBlank())
                            result.add(AdvancedTask(id, kind, title, prompt, mapping = mapping))
                    }
                    "num" -> {
                        val questions = unit.optJSONArray("questions") ?: continue
                        for (qi in 0 until questions.length()) {
                            if (qi % 32 == 0) ensureActive()
                            val q = questions.optJSONObject(qi) ?: continue
                            val stem = q.optString("stem").trim()
                            val answer = q.optString("answer").trim()
                            if (stem.isBlank() || answer.isBlank() || q.has("image") || q.has("diagram"))
                                continue
                            val complete = listOf(prompt, stem).filter { it.isNotBlank() }.joinToString("\n\n")
                            result.add(AdvancedTask(id + ":" + qi, "num", title, complete, expected = answer))
                        }
                    }
                }
            }
        }
        result
    }

private fun matchNumber(entered: String, expected: String): Boolean {
    val a = entered.trim().replace(',', '.')
    val b = expected.trim().replace(',', '.')
    val aDouble = a.toDoubleOrNull()
    val bDouble = b.toDoubleOrNull()
    return if (aDouble != null && bDouble != null)
        abs(aDouble - bDouble) < 0.000001
    else a.equals(b, ignoreCase = true)
}

@Composable
fun NativeAdvancedPractice(book: StudyBook, onExit: () -> Unit) {
    val context = LocalContext.current.applicationContext
    val progress = remember { StudyProgress(context) }
    var allTasks by remember(book) { mutableStateOf<List<AdvancedTask>>(emptyList()) }
    var tasks by remember(book) { mutableStateOf<List<AdvancedTask>>(emptyList()) }
    var loading by remember(book) { mutableStateOf(true) }
    var error by remember(book) { mutableStateOf("") }
    var index by remember(book) { mutableIntStateOf(0) }
    var correct by remember(book) { mutableIntStateOf(0) }
    var submitted by remember(book) { mutableStateOf(false) }
    var wasCorrect by remember(book) { mutableStateOf(false) }
    var finished by remember(book) { mutableStateOf(false) }
    var sessionId by remember(book) { mutableStateOf(UUID.randomUUID().toString()) }
    var chosenSet by remember(book, index) { mutableStateOf<Set<Int>>(emptySet()) }
    var typed by remember(book, index) { mutableStateOf("") }
    var matched by remember(book, index) { mutableStateOf<Map<String,String>>(emptyMap()) }

    LaunchedEffect(book) {
        loading = true
        error = ""
        try { allTasks = loadAdvanced(context, book) }
        catch (e: CancellationException) { throw e }
        catch (_: Exception) { error = "Բազմաքայլ առաջադրանքները հասանելի չեն։" }
        loading = false
    }
    fun start(count: Int) {
        tasks = allTasks.shuffled().take(count)
        index = 0
        correct = 0
        submitted = false
        finished = false
        sessionId = UUID.randomUUID().toString()
    }
    val t = tasks.getOrNull(index)
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Բազմաքայլ առաջադրանքներ", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text(book.subject + " · " + book.title, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        if (loading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
        else if (error.isNotBlank()) item { Text(error, color = MaterialTheme.colorScheme.error) }
        else if (allTasks.isEmpty()) item {
            Text("Այս գրքում լրացուցիչ ստուգվող առաջադրանքներ դեռ չկան։")
            OutlinedButton(onClick = onExit) { Text("Վերադառնալ") }
        } else if (tasks.isEmpty()) {
            item {
                Text("Հասանելի առաջադրանքներ՝ " + allTasks.size)
                Text("Տեսակներ՝ մի քանի ճիշտ պնդում, հաջորդականություն, համապատասխանեցում և թվային պատասխան։")
            }
            item {
                Button(onClick = { start(20) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Արագ վարժանք · 20 առաջադրանք")
                }
                OutlinedButton(
                    onClick = { start(allTasks.size) },
                    modifier = Modifier.fillMaxWidth()
                ) { Text("Բոլոր առաջադրանքները") }
            }
        } else if (finished) {
            item {
                Text("Ավարտված է", fontSize = 26.sp, fontWeight = FontWeight.Bold)
                Text("Ճիշտ՝ " + correct + " / " + tasks.size, fontSize = 22.sp)
                Text("Արդյունքը պահպանվել է այս սարքում։")
                Button(onClick = { start(tasks.size) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Կրկին փորձել")
                }
                OutlinedButton(onClick = onExit, modifier = Modifier.fillMaxWidth()) {
                    Text("Վերադառնալ շտեմարան")
                }
            }
        } else if (t != null) {
            item {
                Text("Առաջադրանք " + (index + 1) + " / " + tasks.size,
                    color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
                LinearProgressIndicator(
                    progress = { (index + 1).toFloat() / tasks.size },
                    modifier = Modifier.fillMaxWidth()
                )
            }
            item {
                ElevatedCard(shape = RoundedCornerShape(15.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Text(t.title, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(9.dp))
                        Text(t.prompt, fontSize = 16.sp, lineHeight = 25.sp)
                    }
                }
            }
            when (t.type) {
                "set" -> {
                    item { Text("Ընտրիր բոլոր ճիշտ համարները", fontWeight = FontWeight.SemiBold) }
                    items((1..t.count).toList()) { n ->
                        Row(Modifier.fillMaxWidth(), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            Checkbox(
                                checked = n in chosenSet,
                                onCheckedChange = { checked ->
                                    if (!submitted) chosenSet = if (checked) chosenSet + n else chosenSet - n
                                }, enabled = !submitted
                            )
                            Text("Պնդում " + n)
                        }
                    }
                }
                "seq" -> item {
                    OutlinedTextField(
                        value = typed, onValueChange = { if (!submitted) typed = it },
                        label = { Text("Հերթականություն, օրինակ՝ 2,3,1,4") },
                        enabled = !submitted,
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
                "match" -> {
                    item { Text("Գրիր համապատասխան համարը յուրաքանչյուր տառի դիմաց։") }
                    items(t.mapping.keys.sorted()) { key ->
                        OutlinedTextField(
                            value = matched[key] ?: "",
                            onValueChange = { value ->
                                if (!submitted) matched = matched + (key to value.filter { it.isDigit() }.take(2))
                            }, enabled = !submitted, singleLine = true,
                            label = { Text(key + " →") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
                "num" -> item {
                    OutlinedTextField(
                        value = typed, onValueChange = { if (!submitted) typed = it },
                        label = { Text("Պատասխան՝ առանց միավորի") },
                        enabled = !submitted, modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            }
            item {
                if (!submitted) {
                    val canSubmit = when(t.type) {
                        "set" -> chosenSet.isNotEmpty()
                        "match" -> matched.size >= t.mapping.size &&
                            t.mapping.keys.all { !matched[it].isNullOrBlank() }
                        else -> typed.isNotBlank()
                    }
                    Button(
                        enabled = canSubmit,
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            wasCorrect = when(t.type) {
                                "set" -> chosenSet.map { it.toString() }.toSet() == t.answer.toSet()
                                "seq" -> typed.split(Regex("[,;\\s]+")).filter { it.isNotBlank() } == t.answer
                                "match" -> t.mapping.all { (key, value) -> matched[key] == value }
                                "num" -> matchNumber(typed, t.expected)
                                else -> false
                            }
                            if (wasCorrect) correct++
                            submitted = true
                        }
                    ) { Text("Ստուգել") }
                } else {
                    Text(if (wasCorrect) "Ճիշտ է ✓" else "Սխալ է",
                        color = if (wasCorrect) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Bold)
                    if (!wasCorrect) {
                        val right = when(t.type) {
                            "set", "seq" -> t.answer.joinToString(", ")
                            "match" -> t.mapping.entries.sortedBy { it.key }.joinToString(", ") {
                                it.key + "=" + it.value
                            }
                            else -> t.expected
                        }
                        Text("Ճիշտ պատասխան՝ " + right)
                    }
                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            if (index + 1 >= tasks.size) {
                                progress.saveSessionOnce(book.subject, correct, tasks.size, sessionId)
                                finished = true
                            } else {
                                index++
                                submitted = false
                                wasCorrect = false
                            }
                        }
                    ) { Text(if (index + 1 >= tasks.size) "Ավարտել" else "Հաջորդը") }
                }
            }
        }
    }
}
