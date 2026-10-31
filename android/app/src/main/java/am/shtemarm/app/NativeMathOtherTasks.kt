package am.shtemarm.app

import android.content.Context
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilterChip
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Uses precisely the same two source JSON files as the website's math-bank.ts.
 * Never manufactures missing questions or converts open answers to MCQ options.
 */
internal data class MathOtherTask(
    val id: String,
    val title: String,
    val prompt: String,
    val answer: String,
    val kind: String
)

internal suspend fun loadMathOtherTasks(context: Context, part: Int): List<MathOtherTask> =
    withContext(Dispatchers.IO) {
        require(part in 1..2)
        ensureActive()
        val index = context.assets.open("math-books-index.json")
            .bufferedReader(Charsets.UTF_8).use { JSONObject(it.readText()) }
        val textBank = context.assets.open("math-text-questions.json")
            .bufferedReader(Charsets.UTF_8).use { JSONObject(it.readText()) }
        val bookId = "matem-$part"
        val sections = index.optJSONObject("books")?.optJSONObject(bookId)
            ?.optJSONArray("sections") ?: return@withContext emptyList()
        val source = textBank.optJSONObject(bookId)
        val items = ArrayList<MathOtherTask>()
        for (s in 0 until sections.length()) {
            ensureActive()
            val section = sections.optJSONObject(s) ?: continue
            val chapter = section.optInt("chapter")
            val sectionNumber = section.optInt("section")
            val sectionText = source?.optJSONObject("$chapter-$sectionNumber")
            val tasks = section.optJSONArray("tasks") ?: continue
            for (t in 0 until tasks.length()) {
                ensureActive()
                val task = tasks.optJSONObject(t) ?: continue
                val kind = task.optString("answer_type")
                if (kind != "open" && kind != "tf") continue
                val taskNumber = task.optInt("task")
                val answers = task.optJSONArray("answers") ?: continue
                val bankRows = sectionText?.optJSONArray(taskNumber.toString())
                val fallbackRows = task.optJSONArray("questions")
                val count = task.optInt("sub_count", answers.length())
                    .coerceIn(0, answers.length())
                for (i in 0 until count) {
                    ensureActive()
                    val question = bankRows?.optJSONObject(i)
                        ?: fallbackRows?.optJSONObject(i) ?: continue
                    val prompt = question.optString("prompt").trim()
                    val answer = answers.optString(i).trim()
                    if (prompt.isBlank() || answer.isBlank() || answer == "null" ||
                        prompt.contains("still being processed", ignoreCase = true) ||
                        prompt.contains("<img", ignoreCase = true) ||
                        prompt.contains("\\includegraphics", ignoreCase = true)) continue
                    if (kind == "tf" && answer.uppercase() !in setOf("T", "F")) continue
                    items.add(
                        MathOtherTask(
                            id = "math:$bookId:$chapter:$sectionNumber:$taskNumber:${i + 1}",
                            title = "Գլուխ $chapter · Բաժին $sectionNumber · Առաջադրանք $taskNumber",
                            prompt = prompt,
                            answer = answer,
                            kind = kind
                        )
                    )
                }
            }
        }
        items
    }

private fun matchesMathAnswer(input: String, answer: String): Boolean {
    val normalizedInput = input.trim().replace(',', '.')
    val normalizedAnswer = answer.trim().replace(',', '.')
    val left = normalizedInput.toDoubleOrNull()
    val right = normalizedAnswer.toDoubleOrNull()
    return if (left != null && right != null) kotlin.math.abs(left - right) < 1e-8
    else normalizedInput == normalizedAnswer
}

@Composable
internal fun NativeMathOtherTasks(part: Int, onBack: () -> Unit) {
    val context = LocalContext.current.applicationContext
    var all by remember(part) { mutableStateOf<List<MathOtherTask>>(emptyList()) }
    var loading by remember(part) { mutableStateOf(true) }
    var error by remember(part) { mutableStateOf("") }
    var kind by remember(part) { mutableStateOf("open") }
    var index by remember(part, kind) { mutableIntStateOf(0) }
    var typed by remember(part, kind, index) { mutableStateOf("") }
    var choice by remember(part, kind, index) { mutableStateOf("") }
    var checked by remember(part, kind, index) { mutableStateOf(false) }

    LaunchedEffect(part) {
        loading = true
        error = ""
        try {
            all = loadMathOtherTasks(context, part)
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            error = "Մաթեմատիկայի շտեմարանի տվյալները բացել չհաջողվեց։"
        } finally {
            loading = false
        }
    }
    val filtered = remember(all, kind) { all.filter { it.kind == kind } }
    val task = filtered.getOrNull(index)
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            TextButtonBack(onBack)
            Text("Մաթեմատիկա · Մաս $part", style = MaterialTheme.typography.headlineSmall)
            Text("Կայքի շտեմարանի թվային և ճիշտ/սխալ առաջադրանքներ",
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = kind == "open", onClick = { kind = "open" },
                    label = { Text("Թվային պատասխան") })
                FilterChip(selected = kind == "tf", onClick = { kind = "tf" },
                    label = { Text("Ճիշտ / սխալ") })
            }
            Text("Հարցերի աղբյուր՝ կայքի math-books-index.json և math-text-questions.json",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                style = MaterialTheme.typography.bodySmall)
        }
        if (loading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
        else if (error.isNotEmpty()) item {
            Text(error, color = MaterialTheme.colorScheme.error)
        } else if (task == null) item {
            Text("Այս տեսակի ստուգելի տեքստային հարցեր առայժմ հասանելի չեն։")
        } else {
            item {
                Text("Հարց ${index + 1} / ${filtered.size}", fontWeight = FontWeight.Bold)
                LinearProgressIndicator(progress = { (index + 1).toFloat() / filtered.size },
                    modifier = Modifier.fillMaxWidth())
            }
            item {
                ElevatedCard {
                    Column(Modifier.fillMaxWidth().padding(16.dp)) {
                        Text(task.title, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(12.dp))
                        Text(task.prompt, style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
            if (kind == "open") item {
                OutlinedTextField(
                    value = typed,
                    onValueChange = { if (!checked) typed = it.take(100) },
                    enabled = !checked,
                    singleLine = true,
                    label = { Text("Գրիր թվային պատասխանը") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
            if (kind == "tf") item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { choice = "T" }, enabled = !checked,
                        modifier = Modifier.weight(1f)) {
                        Text(if (choice == "T") "✓ Ճիշտ" else "Ճիշտ")
                    }
                    OutlinedButton(onClick = { choice = "F" }, enabled = !checked,
                        modifier = Modifier.weight(1f)) {
                        Text(if (choice == "F") "✓ Սխալ" else "Սխալ")
                    }
                }
            }
            item {
                if (!checked) {
                    Button(
                        onClick = { checked = true },
                        enabled = if (kind == "open") typed.isNotBlank() else choice.isNotBlank(),
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Ստուգել պատասխանը") }
                } else {
                    val correct = if (kind == "tf") choice == task.answer.uppercase()
                        else matchesMathAnswer(typed, task.answer)
                    Text(if (correct) "Ճիշտ է ✓" else "Սխալ է",
                        color = if (correct) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Bold)
                    if (!correct) {
                        Text("Շտեմարանի պատասխան՝ " +
                            if (kind == "tf") (if (task.answer.uppercase() == "T") "Ճիշտ" else "Սխալ")
                            else task.answer)
                    }
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { index-- }, enabled = index > 0,
                        modifier = Modifier.weight(1f)) { Text("Նախորդ") }
                    Button(onClick = { index++ }, enabled = index < filtered.lastIndex,
                        modifier = Modifier.weight(1f)) { Text("Հաջորդ") }
                }
            }
        }
        item { Spacer(Modifier.height(10.dp)) }
    }
}

@Composable
private fun TextButtonBack(onBack: () -> Unit) {
    androidx.compose.material3.TextButton(onClick = onBack) {
        Text("‹ Վերադառնալ գրքին")
    }
}
