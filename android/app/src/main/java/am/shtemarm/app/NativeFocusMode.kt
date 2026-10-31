package am.shtemarm.app

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

/** Offline focus timer. The countdown pauses when this screen leaves composition. */
@Composable
fun NativeFocusMode() {
    var durationMinutes by remember { mutableIntStateOf(25) }
    var remainingSeconds by remember { mutableIntStateOf(25 * 60) }
    var running by remember { mutableStateOf(false) }
    var completed by remember { mutableIntStateOf(0) }

    LaunchedEffect(running, remainingSeconds) {
        if (running && remainingSeconds > 0) {
            delay(1000L)
            remainingSeconds -= 1
            if (remainingSeconds == 0) {
                running = false
                completed += 1
            }
        }
    }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text("Կենտրոնացման ռեժիմ", style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold)
        Text("Սովորիր առանց շեղումների։ Ժամաչափն աշխատում է առանց ինտերնետի։")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(15, 25, 45).forEach { minutes ->
                FilterChip(
                    selected = durationMinutes == minutes,
                    onClick = {
                        durationMinutes = minutes
                        remainingSeconds = minutes * 60
                        running = false
                    },
                    label = { Text("$minutes րոպե") }
                )
            }
        }
        Text(
            "%02d:%02d".format(remainingSeconds / 60, remainingSeconds % 60),
            style = MaterialTheme.typography.displayLarge,
            fontWeight = FontWeight.Bold
        )
        LinearProgressIndicator(
            progress = { 1f - remainingSeconds.toFloat() / (durationMinutes * 60) },
            modifier = Modifier.fillMaxWidth()
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(
                onClick = { if (remainingSeconds == 0) remainingSeconds = durationMinutes * 60; running = !running }
            ) { Text(if (running) "Դադար" else "Սկսել / շարունակել") }
            OutlinedButton(onClick = {
                running = false
                remainingSeconds = durationMinutes * 60
            }) { Text("Վերսկսել") }
        }
        Text("Ավարտված փուլեր՝ $completed")
        Text("Էջից դուրս գալու դեպքում ժամաչափը դադարում է։",
            style = MaterialTheme.typography.bodySmall)
    }
}
