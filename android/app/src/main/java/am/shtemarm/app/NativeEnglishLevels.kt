package am.shtemarm.app

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
import org.json.JSONObject

/** Original site question bank, repackaged for fully offline native placement practice. */
@Composable
fun NativeEnglishLevels(
    onStart: (String, List<StudyQuestion>, Int, String) -> Unit
) {
    val context = LocalContext.current
    var questions by remember { mutableStateOf<List<StudyQuestion>>(emptyList()) }
    var ready by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        questions = withContext(Dispatchers.IO) {
            try {
                val text = context.assets.open("english-level-practice.json")
                    .bufferedReader(Charsets.UTF_8).use { it.readText() }
                val entries = JSONObject(text).getJSONArray("questions")
                val result = mutableListOf<StudyQuestion>()
                for (i in 0 until entries.length()) {
                    val q = entries.optJSONObject(i) ?: continue
                    val choices = q.optJSONArray("options") ?: continue
                    val options = (0 until choices.length()).map { choices.optString(it) }
                    val correct = q.optInt("answerIndex", -1)
                    val prompt = q.optString("prompt")
                    if (options.size == 4 && correct in 0..3 &&
                        options.all { it.isNotBlank() } && prompt.isNotBlank()) {
                        result.add(
                            StudyQuestion(
                                q.optString("id"), prompt, options, correct,
                                q.optString("passage"), q.optString("explanation")
                            )
                        )
                    }
                }
                result
            } catch (_: Exception) { emptyList() }
        }
        ready = true
    }
    val labels = listOf(
        "a1" to "A1 · Beginner",
        "a2" to "A2 · Elementary",
        "b1" to "B1 · Intermediate",
        "b2" to "B2 · Upper-intermediate",
        "c1" to "C1 · Advanced"
    )
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Անգլերենի մակարդակի ստուգում", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("A1–C1 · 20 հարց ըստ մակարդակի կամ 25 հարցանոց խառը թեստ",
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            ElevatedCard(
                colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("Սրանք ուսումնական CEFR-ի նման հարցեր են, ոչ թե IELTS, TOEFL կամ Քեմբրիջի պաշտոնական թեստեր։ Խոսքը, լսելը և գրելը չեն ստուգվում։",
                    Modifier.padding(16.dp), fontSize = 13.sp)
            }
        }
        if (!ready) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
        else {
            item {
                val byLevel = labels.map { (id, _) ->
                    questions.filter { it.id.lowercase().startsWith(id + "-") }.shuffled().take(5)
                }
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    enabled = byLevel.all { it.size == 5 },
                    onClick = {
                        val mix = byLevel.flatten().shuffled()
                        onStart("Անգլերեն", mix, mix.size, "Անգլերենի մակարդակի ստուգում")
                    }
                ) { Text("Ստուգել մոտավոր մակարդակս · 25 հարց") }
            }
            item { Text("Մակարդակների թեստեր", fontSize = 20.sp, fontWeight = FontWeight.Bold) }
            items(labels) { (id, label) ->
                val pool = questions.filter { it.id.lowercase().startsWith(id + "-") }
                ElevatedCard(shape = RoundedCornerShape(16.dp)) {
                    Row(Modifier.fillMaxWidth().padding(16.dp)) {
                        Column(Modifier.weight(1f)) {
                            Text(label, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
                            Text(pool.size.toString() + " հարց", fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Button(
                            enabled = pool.size == 20,
                            onClick = {
                                onStart("Անգլերեն", pool, 20, label + " թեստ")
                            }
                        ) { Text("Սկսել") }
                    }
                }
            }
        }
    }
}
