package am.shtemarm.app

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

private data class MathPrompt(val topic: String, val position: String, val prompt: String, val options: List<String>)
private data class MathScan(val questions: List<MathPrompt>, val missing: Int)

/** Displays verified transcribed prompts without fabricating answers. */
@Composable
fun NativeMath(bookPart: Int) {
    val context = LocalContext.current
    var questions by remember(bookPart) { mutableStateOf<List<MathPrompt>>(emptyList()) }
    var selectedTopic by remember(bookPart) { mutableStateOf("Բոլոր բաժինները") }
    var index by remember(bookPart) { mutableIntStateOf(0) }
    var loading by remember(bookPart) { mutableStateOf(true) }
    var error by remember(bookPart) { mutableStateOf("") }
    var missingCount by remember(bookPart) { mutableIntStateOf(0) }
    LaunchedEffect(bookPart) {
        loading = true
        error = ""
        try {
            // All existing source transcriptions must be considered. The previous
            // reader only used the small extra bank and hid most of both volumes.
            val scan = withContext(Dispatchers.IO) {
                fun readAsset(name: String): JSONObject =
                    context.assets.open(name).bufferedReader(Charsets.UTF_8)
                        .use { JSONObject(it.readText()) }
                val bookId = "matem-" + bookPart
                val index = readAsset("math-books-index.json")
                    .optJSONObject("books")?.optJSONObject(bookId)
                val main = readAsset("math-text-questions.json").optJSONObject(bookId)
                val extra = readAsset("math-text-questions-extra.json").optJSONObject(bookId)
                val sections = index?.optJSONArray("sections")
                val found = mutableListOf<MathPrompt>()
                var missing = 0

                if (sections != null) for (si in 0 until sections.length()) {
                    val section = sections.optJSONObject(si) ?: continue
                    val chapter = section.optInt("chapter")
                    val sectionNumber = section.optInt("section")
                    val sectionKey = "$chapter-$sectionNumber"
                    val title = section.optString("title").trim()
                    val topic = "Գլուխ $chapter · Բաժին $sectionNumber" +
                        if (title.isBlank()) "" else " · $title"
                    val tasks = section.optJSONArray("tasks") ?: continue
                    for (ti in 0 until tasks.length()) {
                        val task = tasks.optJSONObject(ti) ?: continue
                        val taskNumber = task.optInt("task")
                        val key = taskNumber.toString()
                        val primaryRows = main?.optJSONObject(sectionKey)?.optJSONArray(key)
                        val extraRows = extra?.optJSONObject(sectionKey)?.optJSONArray(key)
                        val originalRows = task.optJSONArray("questions")
                        val count = maxOf(task.optInt("sub_count", 0),
                            primaryRows?.length() ?: 0, extraRows?.length() ?: 0,
                            originalRows?.length() ?: 0)
                        for (qi in 0 until count) {
                            // Use complete transcriptions already in the source repository.
                            // Never fabricate text for a missing position.
                            val candidates = listOf(
                                extraRows?.optJSONObject(qi), primaryRows?.optJSONObject(qi),
                                originalRows?.optJSONObject(qi)
                            )
                            val transcribed = candidates.firstOrNull {
                                val prompt = it?.optString("prompt")?.trim().orEmpty()
                                prompt.isNotBlank() &&
                                    !prompt.contains("still being processed", ignoreCase = true) &&
                                    !prompt.contains("<img", ignoreCase = true)
                            }
                            if (transcribed == null) {
                                missing++
                                continue
                            }
                            val optionsArray = transcribed.optJSONArray("options")
                            val options = if (optionsArray == null) emptyList() else
                                (0 until optionsArray.length()).map {
                                    optionsArray.optString(it).trim()
                                }
                            val displayOptions = options.takeIf {
                                it.size in 2..6 && it.all(String::isNotBlank)
                            } ?: emptyList()
                            found.add(MathPrompt(
                                topic = topic,
                                position = "Առաջադրանք $taskNumber · Հարց " + (qi + 1),
                                prompt = transcribed.optString("prompt").trim(),
                                options = displayOptions
                            ))
                        }
                    }
                }
                MathScan(found, missing)
            }
            questions = scan.questions
            missingCount = scan.missing
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.localizedMessage ?: "Չհաջողվեց բացել մաթեմատիկայի հարցերը։"
            questions = emptyList()
            missingCount = 0
        }
        index = 0
        loading = false
    }
    val filtered = remember(questions, selectedTopic) {
        if (selectedTopic == "Բոլոր բաժինները") questions
        else questions.filter { it.topic == selectedTopic }
    }
    val topics = remember(questions) { questions.map { it.topic }.distinct() }
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Մաթեմատիկա · Մաս " + bookPart, fontWeight = FontWeight.Bold, fontSize = 25.sp)
            Text("Թվայնացված առաջադրանքների ընթերցում", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            ElevatedCard(colors = CardDefaults.elevatedCardColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer
            )) {
                Text("Այս ընթերցիչը միավորում է առկա հիմնական, լրացուցիչ և գրքի ինդեքսի թվայնացումները։ Չհաստատված պատասխանները չեն գնահատվում. բացակայող հարցերը չեն հորինվում։",
                    Modifier.padding(16.dp), fontSize = 13.sp)
            }
        }
        if (loading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
        else if (error.isNotBlank()) item { Text(error, color = MaterialTheme.colorScheme.error) }
        else {
            item {
                Text("Թվայնացված հարցեր՝ " + questions.size, fontWeight = FontWeight.SemiBold)
                Text("Դեռ չթվայնացված դիրքեր՝ " + missingCount,
                    color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                Text("Ընտրել բաժինը", fontWeight = FontWeight.Bold)
                FilterChip(
                    selected = selectedTopic == "Բոլոր բաժինները",
                    onClick = { selectedTopic = "Բոլոր բաժինները"; index = 0 },
                    label = { Text("Բոլոր բաժինները") }
                )
            }
            items(topics) { topic ->
                FilterChip(
                    selected = selectedTopic == topic,
                    onClick = { selectedTopic = topic; index = 0 },
                    label = { Text(topic) }
                )
            }
            if (filtered.isNotEmpty()) {
                item {
                    val q = filtered[index.coerceIn(0, filtered.lastIndex)]
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp)
                    ) {
                        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("Հարց " + (index + 1) + " / " + filtered.size,
                                color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            Text(q.topic + " · " + q.position, fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(q.prompt, fontSize = 19.sp, lineHeight = 27.sp, fontWeight = FontWeight.SemiBold)
                            q.options.forEachIndexed { i, option ->
                                Surface(shape = RoundedCornerShape(10.dp),
                                    color = MaterialTheme.colorScheme.surfaceContainerHigh) {
                                    Text(("ABCD".getOrNull(i) ?: '•').toString() + ". " + option,
                                        Modifier.fillMaxWidth().padding(13.dp))
                                }
                            }
                        }
                    }
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            enabled = index > 0,
                            onClick = { index-- },
                            modifier = Modifier.weight(1f)
                        ) { Text("Նախորդ") }
                        Button(
                            enabled = index < filtered.size - 1,
                            onClick = { index++ },
                            modifier = Modifier.weight(1f)
                        ) { Text("Հաջորդ") }
                    }
                }
            } else item { Text("Այս բաժնում դեռ ընթեռնելի հարցեր չկան։") }
        }
    }
}
