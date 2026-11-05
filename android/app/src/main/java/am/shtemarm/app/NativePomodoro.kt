package am.shtemarm.app

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

/** Native-only optional timer. Manual and automatic breaks are student controlled. */
internal enum class PomodoroPhase { STUDY, BREAK }

internal data class PomodoroState(
    val phase: PomodoroPhase = PomodoroPhase.STUDY,
    val remainingSeconds: Int = 25 * 60,
    val running: Boolean = false,
    val autoBreak: Boolean = false,
    val studyMinutes: Int = 25,
    val breakMinutes: Int = 5,
) {
    fun tick(): PomodoroState {
        if (!running) return this
        if (remainingSeconds > 1) return copy(remainingSeconds = remainingSeconds - 1)
        return if (phase == PomodoroPhase.STUDY && autoBreak)
            copy(phase = PomodoroPhase.BREAK, remainingSeconds = breakMinutes * 60)
        else copy(remainingSeconds = 0, running = false)
    }
    fun switchPhase(): PomodoroState {
        val next = if (phase == PomodoroPhase.STUDY) PomodoroPhase.BREAK else PomodoroPhase.STUDY
        return copy(phase = next, remainingSeconds = (if (next == PomodoroPhase.STUDY) studyMinutes else breakMinutes) * 60, running = false)
    }
}

@Composable
internal fun NativePomodoro(language: String) {
    var timer by remember { mutableStateOf(PomodoroState()) }
    LaunchedEffect(timer.running, timer.phase, timer.autoBreak) {
        while (timer.running) {
            delay(1000)
            timer = timer.tick()
        }
    }
    val en = language == "en"
    val ru = language == "ru"
    fun tr(hy: String, english: String, russian: String) = if (en) english else if (ru) russian else hy
    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(tr("Ուսման ժամանակաչափ", "Study timer", "Таймер занятий"), style = MaterialTheme.typography.titleLarge)
        Text(tr("Միայն Android հավելվածում", "Android app only", "Только в Android-приложении"))
        Text(if (timer.phase == PomodoroPhase.STUDY) tr("Ուսում", "Study", "Учёба") else tr("Ընդմիջում", "Break", "Перерыв"))
        Text("%02d:%02d".format(timer.remainingSeconds / 60, timer.remainingSeconds % 60), style = MaterialTheme.typography.headlineLarge)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { timer = timer.copy(running = !timer.running) }) {
                Text(if (timer.running) tr("Դադար", "Pause", "Пауза") else tr("Սկսել", "Start", "Начать"))
            }
            OutlinedButton(onClick = { timer = timer.switchPhase() }) { Text(tr("Փոխել փուլը", "Switch phase", "Сменить этап")) }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(tr("Ավտոմատ ընդմիջում", "Automatic breaks", "Автоматический перерыв"))
            Switch(checked = timer.autoBreak, onCheckedChange = { timer = timer.copy(autoBreak = it) })
        }
        Text(tr("Ուսման տևողություն", "Study duration", "Длительность учёбы"))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(15, 25, 45).forEach { minutes ->
                OutlinedButton(onClick = { timer = timer.copy(studyMinutes = minutes, remainingSeconds = if (timer.phase == PomodoroPhase.STUDY) minutes * 60 else timer.remainingSeconds, running = false) }) { Text("$minutes") }
            }
        }
        Text(tr("Ընդմիջման տևողություն", "Break duration", "Длительность перерыва"))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(5, 10, 15).forEach { minutes ->
                OutlinedButton(onClick = { timer = timer.copy(breakMinutes = minutes, remainingSeconds = if (timer.phase == PomodoroPhase.BREAK) minutes * 60 else timer.remainingSeconds, running = false) }) { Text("$minutes") }
            }
        }
        Text(tr("Ժամանակաչափը աշխատում է միայն բաց էկրանի ընթացքում։", "Timer runs while this screen is open.", "Таймер работает, пока открыт экран."))
    }
}
