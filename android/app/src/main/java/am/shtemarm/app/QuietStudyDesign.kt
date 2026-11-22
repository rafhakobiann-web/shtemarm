package am.shtemarm.app

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun QuietTopBar(
    studyLanguage: String,
    onProgress: () -> Unit,
    onSaved: () -> Unit,
    onSettings: () -> Unit
) {
    Surface(color = MaterialTheme.colorScheme.background, tonalElevation = 0.dp) {
        Row(
            Modifier.fillMaxWidth().windowInsetsPadding(WindowInsets.statusBars)
                .height(60.dp).padding(horizontal = 18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(R.drawable.ic_launcher),
                contentDescription = "Shtemarm",
                modifier = Modifier.size(34.dp).clip(RoundedCornerShape(10.dp))
            )
            Spacer(Modifier.width(9.dp))
            Text("Shtemarm", fontWeight = FontWeight.Bold, fontSize = 19.sp,
                color = MaterialTheme.colorScheme.onSurface, modifier = Modifier.weight(1f))
            IconButton(onClick = onProgress) {
                Icon(Icons.Default.Star, NativeStudyGuide.label(studyLanguage, "Իմ առաջընթացը", "My progress", "Мой прогресс"), tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            IconButton(onClick = onSaved) {
                Icon(Icons.Default.Bookmark, NativeStudyGuide.label(studyLanguage, "Պահպանված հարցեր", "Saved questions", "Сохранённые вопросы"), tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            IconButton(onClick = onSettings) {
                Icon(Icons.Default.Settings, NativeStudyGuide.label(studyLanguage, "Կարգավորումներ", "Settings", "Настройки"), tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
fun QuietBottomBar(studyLanguage: String, selected: Int, onSelect: (Int) -> Unit) {
    val labels = listOf(
        NativeStudyGuide.label(studyLanguage, "Գլխավոր", "Home", "Главная") to Icons.Default.Home,
        NativeStudyGuide.label(studyLanguage, "Առարկաներ", "Subjects", "Предметы") to Icons.Default.Book,
        NativeStudyGuide.label(studyLanguage, "Քննություն", "Practice", "Практика") to Icons.Default.CheckCircle,
        NativeStudyGuide.label(studyLanguage, "Գործիքներ", "Tools", "Инструменты") to Icons.Default.Build
    )
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 2.dp,
        windowInsets = WindowInsets.navigationBars
    ) {
        labels.forEachIndexed { index, (label, icon) ->
            NavigationBarItem(
                selected = selected == index,
                onClick = { onSelect(index) },
                icon = { Icon(icon, contentDescription = label) },
                label = { Text(label, maxLines = 1, fontSize = 11.sp) },
                alwaysShowLabel = true
            )
        }
    }
}

@Composable
fun QuietHome(
    studyLanguage: String,
    modifier: Modifier = Modifier,
    today: Int,
    target: Int,
    answered: Int,
    mistakes: Int,
    lastSubject: String?,
    lastTitle: String?,
    subjects: List<String>,
    onContinue: () -> Unit,
    onSubjects: () -> Unit,
    onSubject: (String) -> Unit,
    onExams: () -> Unit,
    onMistakes: () -> Unit,
    onProgress: () -> Unit,
    onGames: () -> Unit
) {
    val label: (String, String, String) -> String = { hy, en, ru ->
        NativeStudyGuide.label(studyLanguage, hy, en, ru)
    }
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 18.dp, bottom = 20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Text(label("ՔՈ ՈՒՍՈՒՄՆԱԿԱՆ ՏԱՐԱԾՔԸ", "YOUR STUDY SPACE", "ТВОЁ УЧЕБНОЕ ПРОСТРАНСТВО"),
                    color = MaterialTheme.colorScheme.primary, fontSize = 11.sp,
                    fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Text(label("Սովորիր քո տեմպով։", "Learn at your own pace.", "Учись в своём темпе."),
                    color = MaterialTheme.colorScheme.onSurface, fontSize = 26.sp,
                    fontWeight = FontWeight.Bold, lineHeight = 34.sp)
                Text(label("Ընտրիր մի փոքր քայլ և սկսիր։", "Choose one small step and begin.", "Выбери небольшой шаг и начни."),
                    color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 14.sp)
            }
        }
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
            ) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(11.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(label("Այսօրվա նպատակը", "Today's goal", "Цель на сегодня"),
                            fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text("$today / $target", color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold)
                    }
                    LinearProgressIndicator(
                        progress = { StudyGoals.completion(target, today) },
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(4.dp)),
                        trackColor = MaterialTheme.colorScheme.surfaceContainerHighest
                    )
                    Text(
                        if (StudyGoals.remaining(target, today) == 0)
                            label("Այսօրվա նպատակը կատարված է։", "Goal complete for today.", "Цель на сегодня выполнена.")
                        else label(
                            "Մնացել է ${StudyGoals.remaining(target, today)} հարց։",
                            "${StudyGoals.remaining(target, today)} questions to go.",
                            "Осталось вопросов: ${StudyGoals.remaining(target, today)}."
                        ),
                        color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp
                    )
                }
            }
        }
        item {
            val hasLast = !lastSubject.isNullOrBlank() && !lastTitle.isNullOrBlank()
            Surface(
                modifier = Modifier.fillMaxWidth().clickable(onClick = if (hasLast) onContinue else onSubjects),
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.primaryContainer
            ) {
                Row(Modifier.padding(horizontal = 18.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(if (hasLast) label("Շարունակել ուսումը", "Continue studying", "Продолжить занятие")
                            else label("Սկսել ուսումը", "Start studying", "Начать заниматься"),
                            fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        Text(if (hasLast) "$lastSubject · $lastTitle"
                            else label("Ընտրիր առարկա և բացիր շտեմարանը։", "Choose a subject and open a book.", "Выбери предмет и открой сборник."),
                            color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp,
                            maxLines = 2, overflow = TextOverflow.Ellipsis)
                    }
                    Text(label("Բացել", "Open", "Открыть"), color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 10.dp))
                }
            }
        }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(label("Առարկաներ", "Subjects", "Предметы"), fontSize = 19.sp,
                    fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                TextButton(onClick = onSubjects) { Text(label("Բոլորը", "See all", "Все")) }
            }
        }
        items(subjects.chunked(2)) { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { subject ->
                    Surface(
                        modifier = Modifier.weight(1f).heightIn(min = 76.dp)
                            .clickable { onSubject(subject) },
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
                    ) {
                        Row(Modifier.padding(horizontal = 13.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(8.dp).clip(RoundedCornerShape(50))
                                .background(MaterialTheme.colorScheme.primary))
                            Spacer(Modifier.width(9.dp))
                            Text(subject, modifier = Modifier.weight(1f), fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold, maxLines = 2,
                                overflow = TextOverflow.Ellipsis)
                        }
                    }
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
        item {
            Surface(
                modifier = Modifier.fillMaxWidth().clickable(onClick = onProgress),
                color = MaterialTheme.colorScheme.surfaceContainerLow,
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text(label("Քո առաջընթացը", "Your progress", "Твой прогресс"), fontWeight = FontWeight.SemiBold)
                        Text(label("Լուծված է $answered հարց", "$answered questions answered", "Решено вопросов: $answered"),
                            color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                    Text("›", color = MaterialTheme.colorScheme.primary, fontSize = 27.sp)
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(onClick = onExams, modifier = Modifier.weight(1f).heightIn(min = 48.dp)) {
                    Text(label("Փորձնական քննություն", "Mock exam", "Пробный экзамен"), maxLines = 1, fontSize = 12.sp)
                }
                if (mistakes > 0) OutlinedButton(onClick = onMistakes,
                    modifier = Modifier.weight(1f).heightIn(min = 48.dp)) {
                    Text(label("Կրկնել սխալները", "Review mistakes", "Повторить ошибки"), maxLines = 1, fontSize = 12.sp)
                } else OutlinedButton(onClick = onGames,
                    modifier = Modifier.weight(1f).heightIn(min = 48.dp)) {
                    Text(label("Բառապաշար", "Vocabulary", "Словарь"), maxLines = 1, fontSize = 12.sp)
                }
            }
        }
        item { Spacer(Modifier.height(4.dp)) }
    }
}
