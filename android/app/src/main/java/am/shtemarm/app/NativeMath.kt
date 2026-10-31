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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.ensureActive
import org.json.JSONObject

private data class MathPrompt(val topic: String, val prompt: String, val options: List<String>)

/** Displays verified transcribed prompts without fabricating answers. */
@Composable
fun NativeMath(bookPart: Int) {
    val context = LocalContext.current
    var questions by remember(bookPart) { mutableStateOf<List<MathPrompt>>(emptyList()) }
    var selectedTopic by remember(bookPart) { mutableStateOf("Բոլոր բաժինները") }
    var index by remember(bookPart) { mutableIntStateOf(0) }
    var loading by remember(bookPart) { mutableStateOf(true) }
    var error by remember(bookPart) { mutableStateOf("") }
    LaunchedEffect(bookPart) {
        loading = true
        error = ""
        questions = try {
            withContext(Dispatchers.IO) {
                ensureActive()
                val text = context.assets.open("math-text-questions-extra.json")
                    .bufferedReader(Charsets.UTF_8).use { it.readText() }
                val book = JSONObject(text).optJSONObject("matem-" + bookPart)
                    ?: return@withContext emptyList()
                val entries = mutableListOf<MathPrompt>()
                for (sectionKey in book.keys()) {
                    ensureActive()
                    val section = book.optJSONObject(sectionKey) ?: continue
                    for (taskKey in section.keys()) {
                        ensureActive()
                        val items = section.optJSONArray(taskKey) ?: continue
                        for (i in 0 until items.length()) {
                            if (i % 32 == 0) ensureActive()
                            val item = items.optJSONObject(i) ?: continue
                            val textValue = item.optString("prompt").trim()
                            val optionsArray = item.optJSONArray("options") ?: continue
                            val answers = (0 until optionsArray.length()).map {
                                optionsArray.optString(it)
                            }
                            if (textValue.isNotBlank() && answers.size in 2..6 &&
                                answers.all { it.isNotBlank() }) {
                                entries.add(MathPrompt(
                                    "Բաժին " + sectionKey + " · Առաջադրանք " + taskKey,
                                    textValue, answers
                                ))
                            }
                        }
                    }
                }
                entries
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.localizedMessage ?: "Չհաջողվեց բացել մաթեմատիկայի հարցերը։"
            emptyList()
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
                Text("Այս առաջադրանքների պատասխանները դեռ չեն հաստատվել։ Կարող ես լուծել թղթի վրա և համեմատել գրքի հետ։ Հավելվածը չի գնահատում այս բաժինը։",
                    Modifier.padding(16.dp), fontSize = 13.sp)
            }
        }
        if (loading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
        else if (error.isNotBlank()) item { Text(error, color = MaterialTheme.colorScheme.error) }
        else {
            item {
                Text("Հարցեր՝ " + questions.size, fontWeight = FontWeight.SemiBold)
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
                            Text(q.topic, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
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
