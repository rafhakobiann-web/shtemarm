package am.shtemarm.app

import java.util.UUID
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

/** Native matching game pairing a question with the verified answer from its book. */
@Composable
fun NativeMatchingGame(subject: String, questions: List<StudyQuestion>) {
    val context = LocalContext.current.applicationContext
    val progress = remember { StudyProgress(context) }
    var round by remember { mutableIntStateOf(0) }
    val pool = remember(questions, round) {
        questions.filter { it.choices.size >= 2 }
            .shuffled()
            .distinctBy { it.choices[it.correctIndex].trim().lowercase() }
            .take(5)
    }
    val answerOrder = remember(pool) { pool.shuffled() }
    var selectedId by remember(round) { mutableStateOf<String?>(null) }
    var solvedIds by remember(round) { mutableStateOf<Set<String>>(emptySet()) }
    var wrongIds by remember(round) { mutableStateOf<Set<String>>(emptySet()) }
    var message by remember(round) { mutableStateOf("Ընտրիր հարցը, ապա՝ համապատասխան պատասխանը։") }
    var sessionSaved by remember(round) { mutableStateOf(false) }
    val sessionId = remember(round) { UUID.randomUUID().toString() }
    val completed = pool.isNotEmpty() && solvedIds.size == pool.size
    if (completed && !sessionSaved) {
        // Saving in a launch effect prevents persistence from running during composition.
        LaunchedEffect(completed, round) {
            progress.saveSessionOnce(subject, pool.size - wrongIds.size, pool.size, sessionId)
            sessionSaved = true
        }
    }
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Text("Համապատասխանեցում", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text(subject + " · Մինի խաղ", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(8.dp))
            Text("Զույգեր՝ " + solvedIds.size + " / " + pool.size, fontWeight = FontWeight.SemiBold)
            LinearProgressIndicator(
                progress = { if (pool.isEmpty()) 0f else solvedIds.size.toFloat() / pool.size },
                modifier = Modifier.fillMaxWidth()
            )
            Text(message, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        if (pool.size < 2) {
            item { Text("Անհրաժեշտ են առնվազն երկու տարբեր հարցեր։") }
        } else if (completed) {
            item {
                ElevatedCard(shape = RoundedCornerShape(18.dp)) {
                    Column(Modifier.fillMaxWidth().padding(22.dp)) {
                        Text("Բոլոր զույգերը գտնված են!", fontWeight = FontWeight.Bold, fontSize = 22.sp)
                        Text("Առաջին փորձից ճիշտ՝ " + (pool.size - wrongIds.size) + " / " + pool.size)
                        Spacer(Modifier.height(10.dp))
                        Button(onClick = { round++ }, modifier = Modifier.fillMaxWidth()) {
                            Text("Նոր խաղ")
                        }
                    }
                }
            }
        } else {
            item { Text("Հարցեր", fontWeight = FontWeight.Bold, fontSize = 18.sp) }
            items(pool, key = { "question-" + it.id }) { q ->
                val solved = q.id in solvedIds
                FilterChip(
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !solved,
                    selected = selectedId == q.id || solved,
                    onClick = { selectedId = q.id; message = "Ընտրիր ճիշտ պատասխանը։" },
                    label = {
                        Text(if (solved) "✓ " + q.stem else q.stem, maxLines = 4)
                    }
                )
            }
            item { Text("Պատասխաններ", fontWeight = FontWeight.Bold, fontSize = 18.sp) }
            items(answerOrder, key = { "answer-" + it.id }) { q ->
                if (q.id !in solvedIds) {
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth().clickable {
                            val chosen = selectedId
                            if (chosen == null) {
                                message = "Սկզբում ընտրիր հարցը։"
                            } else if (chosen == q.id) {
                                solvedIds = solvedIds + chosen
                                selectedId = null
                                message = "Ճիշտ է ✓"
                            } else {
                                wrongIds = wrongIds + chosen
                                message = "Դեռ ճիշտ չէ։ Փորձիր նորից։"
                            }
                        }, shape = RoundedCornerShape(14.dp)
                    ) {
                        Text(q.choices[q.correctIndex], Modifier.padding(16.dp))
                    }
                }
            }
            item {
                TextButton(onClick = { round++ }, modifier = Modifier.fillMaxWidth()) {
                    Text("Սկսել նոր խաղ")
                }
            }
        }
    }
}
