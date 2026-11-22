package am.shtemarm.app

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
internal fun NativeStudentOnboarding(
    progress: StudyProgress,
    onComplete: (language: String, dailyGoal: Int) -> Unit
) {
    var step by remember { mutableIntStateOf(0) }
    var language by remember { mutableStateOf(progress.studyLanguage) }
    var grade by remember { mutableStateOf(progress.studentGrade.ifBlank { "12" }) }
    var focus by remember { mutableStateOf(progress.focusSubjects) }
    var offlineBooks by remember { mutableStateOf(progress.offlineBookAssets) }
    var dailyGoal by remember { mutableIntStateOf(progress.dailyQuestionTarget) }
    var source by remember { mutableStateOf(progress.discoverySource.ifBlank { "skip" }) }
    val scrollState = rememberScrollState()
    val scope = rememberCoroutineScope()

    val titles = listOf(
        NativeStudyGuide.label(language, "Բարի գալուստ Shtemarm", "Welcome to Shtemarm", "Добро пожаловать в Shtemarm"),
        NativeStudyGuide.label(language, "Ո՞ր դասարանում ես", "What grade are you in?", "В каком ты классе?"),
        NativeStudyGuide.label(language, "Ի՞նչ ես պատրաստվում սովորել", "What do you want to study?", "Что ты хочешь изучать?"),
        NativeStudyGuide.label(language, "Կազմիր քո անցանց գրադարանը", "Build your offline shelf", "Собери свою офлайн-библиотеку"),
        NativeStudyGuide.label(language, "Ստեղծենք քո ուսման ռիթմը", "Set your study rhythm", "Настрой свой ритм занятий")
    )

    Column(
        Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)
            .verticalScroll(scrollState).padding(horizontal = 22.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("SHTEMARM", color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold, letterSpacing = 2.sp, fontSize = 12.sp)
        LinearProgressIndicator(progress = { (step + 1) / 5f }, modifier = Modifier.fillMaxWidth())
        Text("${step + 1} / 5", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        Text(titles[step], style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        when (step) {
            0 -> {
                Text(NativeStudyGuide.label(language,
                    "Ընտրիր հավելվածի լեզուն։ Քո ընտրությունը կարող ես փոխել Կարգավորումներում։",
                    "Choose the app language. You can change it later in Settings.",
                    "Выбери язык приложения. Его можно изменить в настройках."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                listOf("hy" to "Հայերեն", "en" to "English", "ru" to "Русский").forEach { (code, label) ->
                    LanguageChoice(label, selected = language == code) { language = code }
                }
                Text(NativeStudyGuide.label(language,
                    "Հաշիվ ստեղծել պարտադիր չէ․ նախապատվությունները պահվում են միայն այս սարքում։",
                    "No account is required. Your preferences stay on this device.",
                    "Регистрация не обязательна. Настройки сохраняются только на этом устройстве."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
            }
            1 -> {
                Text(NativeStudyGuide.label(language,
                    "Սա օգնում է առաջարկել համապատասխան ուսումնական նյութեր։",
                    "This helps us tailor your study suggestions.",
                    "Это поможет подобрать подходящие материалы."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                listOf("9", "10", "11", "12", "other").forEach { value ->
                    val label = when (value) {
                        "other" -> NativeStudyGuide.label(language, "Այլ / ինքնուրույն եմ սովորում", "Other / self-study", "Другое / готовлюсь самостоятельно")
                        else -> NativeStudyGuide.label(language, "$value-րդ դասարան", "Grade $value", "$value класс")
                    }
                    ChoiceRow(label, selected = grade == value) { grade = value }
                }
            }
            2 -> {
                Text(NativeStudyGuide.label(language,
                    "Կարող ես ընտրել մի քանիսը կամ թողնել բոլորը։",
                    "Choose several subjects, or keep them all selected.",
                    "Выбери несколько предметов или оставь все."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                BookCatalog.subjects.forEachIndexed { index, subject ->
                    val selected = subject in focus
                    val accent = subjectAccent(index)
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth().clickable {
                            focus = if (selected && focus.size > 1) focus - subject else focus + subject
                        },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.elevatedCardColors(
                            containerColor = if (selected) accent.copy(alpha = 0.10f)
                                else MaterialTheme.colorScheme.surface
                        )
                    ) {
                        Row(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(10.dp).background(accent, RoundedCornerShape(50)))
                            Spacer(Modifier.width(12.dp))
                            Text(subject, modifier = Modifier.weight(1f), fontWeight = FontWeight.Medium)
                            Checkbox(checked = selected, onCheckedChange = {
                                focus = if (it) focus + subject
                                    else if (focus.size > 1) focus - subject else focus
                            })
                        }
                    }
                }
            }
            3 -> {
                Text(NativeStudyGuide.label(language,
                    "Նշիր գրքերը, որոնք ուզում ես արագ գտնել քո անցանց դարակում։ Տեղադրված գրքերը հասանելի են նաև առանց ինտերնետի։",
                    "Choose books to pin in your offline shelf. Books included in the app work without internet.",
                    "Отметь книги для быстрой офлайн-полки. Книги в приложении доступны без интернета."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                BookCatalog.books.forEach { book ->
                    val pinned = book.asset in offlineBooks
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth().clickable {
                            offlineBooks = if (pinned) offlineBooks - book.asset else offlineBooks + book.asset
                        },
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Row(Modifier.fillMaxWidth().padding(start = 14.dp, end = 8.dp, top = 5.dp, bottom = 5.dp),
                            verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(book.title, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                Text(book.subject, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                            }
                            Checkbox(checked = pinned, onCheckedChange = {
                                offlineBooks = if (it) offlineBooks + book.asset else offlineBooks - book.asset
                            })
                        }
                    }
                }
            }
            4 -> {
                Text(NativeStudyGuide.label(language,
                    "Ընտրիր օրական փոքր, իրատեսական նպատակ։ Կարող ես փոխել այն ցանկացած պահի։",
                    "Pick a small, realistic daily goal. You can change it any time.",
                    "Выбери небольшую ежедневную цель. Ее можно изменить в любой момент."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                listOf(5, 10, 20, 30).forEach { goal ->
                    ChoiceRow(
                        NativeStudyGuide.label(language, "$goal հարց օրական", "$goal questions a day", "$goal вопросов в день"),
                        selected = dailyGoal == goal
                    ) { dailyGoal = goal }
                }
                Spacer(Modifier.height(4.dp))
                Text(NativeStudyGuide.label(language,
                    "Որտեղի՞ց իմացար Shtemarm-ի մասին։",
                    "Where did you hear about Shtemarm?",
                    "Откуда ты узнал о Shtemarm?"),
                    fontWeight = FontWeight.SemiBold)
                listOf(
                    "tiktok" to "TikTok", "instagram" to "Instagram", "youtube" to "YouTube",
                    "friend" to NativeStudyGuide.label(language, "Ընկերներից", "A friend", "От друзей"),
                    "teacher" to NativeStudyGuide.label(language, "Ուսուցչից", "A teacher", "От учителя"),
                    "search" to NativeStudyGuide.label(language, "Որոնումից", "Web search", "Из поиска"),
                    "school" to NativeStudyGuide.label(language, "Դպրոցից", "School", "Из школы"),
                    "other" to NativeStudyGuide.label(language, "Այլ", "Other", "Другое"),
                    "skip" to NativeStudyGuide.label(language, "Չեմ ուզում նշել", "Prefer not to say", "Не хочу отвечать")
                ).forEach { (key, label) ->
                    FilterChip(selected = source == key, onClick = { source = key }, label = { Text(label) })
                }
            }
        }

        Spacer(Modifier.height(4.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (step > 0) {
                OutlinedButton(onClick = { step--; scope.launch { scrollState.scrollTo(0) } }, modifier = Modifier.weight(1f)) {
                    Text(NativeStudyGuide.label(language, "Հետ", "Back", "Назад"))
                }
            }
            Button(
                onClick = {
                    if (step < 4) {
                        step++
                        scope.launch { scrollState.scrollTo(0) }
                    } else {
                        progress.saveStudentSetup(language, grade, focus, source, offlineBooks, dailyGoal)
                        onComplete(language, dailyGoal)
                    }
                },
                modifier = Modifier.weight(1f)
            ) {
                Text(if (step == 4)
                    NativeStudyGuide.label(language, "Սկսել սովորել", "Start learning", "Начать учиться")
                else NativeStudyGuide.label(language, "Շարունակել", "Continue", "Продолжить"))
            }
        }
        Spacer(Modifier.height(18.dp))
    }
}

@Composable
private fun LanguageChoice(label: String, selected: Boolean, onClick: () -> Unit) =
    ChoiceRow(label, selected, onClick)

@Composable
private fun ChoiceRow(label: String, selected: Boolean, onClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = if (selected) MaterialTheme.colorScheme.primaryContainer
                else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(Modifier.fillMaxWidth().padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
            RadioButton(selected = selected, onClick = onClick)
            Text(label, modifier = Modifier.weight(1f), fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal)
        }
    }
}

private fun subjectAccent(index: Int) = listOf(
    Color(0xFF147C70), Color(0xFF2563A6), Color(0xFF8C4BA8),
    Color(0xFFB76424), Color(0xFF3A7C3D), Color(0xFFB34455)
)[index % 6]


@Composable
internal fun NativeOfflineLibrary(
    selectedAssets: Set<String>,
    language: String,
    onToggle: (String, Boolean) -> Unit,
    onOpen: (StudyBook) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(NativeStudyGuide.label(language, "Իմ անցանց դարակը", "My offline shelf", "Моя офлайн-полка"),
                style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(
                NativeStudyGuide.label(language,
                    "Այս գրքերը ներառված են հավելվածում և հասանելի են առանց ինտերնետի։ Նշիր կարևոր գրքերը՝ դրանք արագ գտնելու համար։",
                    "These books are included in the app and work offline. Pin the ones you want to reach quickly.",
                    "Эти книги входят в приложение и доступны без интернета. Закрепи нужные для быстрого доступа."),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(4.dp))
        }
        items(BookCatalog.books, key = { it.asset + it.title }) { book ->
            val pinned = book.asset in selectedAssets
            ElevatedCard(shape = RoundedCornerShape(16.dp)) {
                Column(Modifier.fillMaxWidth().padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(book.subject, color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                            Text(book.title, fontWeight = FontWeight.SemiBold)
                        }
                        Checkbox(checked = pinned, onCheckedChange = { onToggle(book.asset, it) })
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            NativeStudyGuide.label(language, "Հասանելի է անցանց", "Available offline", "Доступно офлайн"),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp,
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(onClick = { onOpen(book) }) {
                            Text(NativeStudyGuide.label(language, "Բացել", "Open", "Открыть"))
                        }
                    }
                }
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}
