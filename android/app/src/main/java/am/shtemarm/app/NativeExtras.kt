package am.shtemarm.app

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

private val examCounts = mapOf(
    "Անգլերեն" to 80, "Հայոց լեզու" to 70, "Հայոց պատմություն" to 70,
    "Կենսաբանություն" to 70, "Ֆիզիկա" to 70, "Քիմիա" to 70,
    "Աշխարհագրություն" to 70, "Ռուսերեն" to 80
)

/** Sample exams built from existing MCQs. These are NOT official GTC blueprint replicas. */
@Composable
fun NativeExams(repository: QuestionRepository, onStart: (String, List<StudyQuestion>, Int, String) -> Unit) {
    var selected by remember { mutableStateOf(BookCatalog.subjects.first()) }
    var pool by remember { mutableStateOf<List<StudyQuestion>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    var count by remember { mutableIntStateOf(20) }
    var showEnglishLevels by remember { mutableStateOf(false) }
    LaunchedEffect(selected) {
        isLoading = true
        error = ""
        pool = emptyList()
        try {
            val collected = mutableListOf<StudyQuestion>()
            for (b in BookCatalog.books.filter { it.subject == selected }) {
                collected += repository.load(b).allQuestions
            }
            pool = collected.distinctBy { it.id }
            if (pool.isEmpty()) error = "Այս առարկայի ստուգված բազմընտրանի հարցեր դեռ չկան։"
        } catch (_: Exception) { error = "Հարցաշարերը չհաջողվեց բացել։" }
        isLoading = false
    }
    if (showEnglishLevels) {
        Column(Modifier.fillMaxSize()) {
            TextButton(onClick = { showEnglishLevels = false }) { Text("‹ Թեստեր") }
            Box(Modifier.weight(1f)) { NativeEnglishLevels(onStart) }
        }
        return
    }
    LazyColumn(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(13.dp)
    ) {
        item {
            Text("Քննություններ և թեստեր", fontSize = 25.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(5.dp))
            Text("Կազմիր փորձնական թեստ առկա շտեմարաններից։", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            ElevatedCard(
                modifier = Modifier.fillMaxWidth().clickable { showEnglishLevels = true },
                shape = RoundedCornerShape(17.dp)
            ) {
                Column(Modifier.padding(18.dp)) {
                    Text("Անգլերենի մակարդակի ստուգում · A1–C1",
                        fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Spacer(Modifier.height(5.dp))
                    Text("20 հարց յուրաքանչյուր մակարդակի համար և 25 հարցանոց խառը թեստ։")
                    Spacer(Modifier.height(7.dp))
                    Text("Բացել →", color = MaterialTheme.colorScheme.primary)
                }
            }
        }
        item {
            ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                Text("Ուշադրություն. այս վարժանքը կազմված է միայն բազմընտրանի հարցերից և չի կրկնում ԳԹԿ քննության պաշտոնական կառուցվածքը կամ գնահատման համակարգը։",
                    Modifier.padding(16.dp), fontSize = 13.sp)
            }
        }
        item {
            Text("Ընտրիր առարկան", fontWeight = FontWeight.SemiBold)
        }
        items(BookCatalog.subjects) { s ->
            FilterChip(selected = selected == s, onClick = { selected = s }, label = { Text(s) })
        }
        item {
            HorizontalDivider()
            if (isLoading) LinearProgressIndicator(Modifier.fillMaxWidth())
            else {
                Text("Հասանելի հարցեր՝ " + pool.size, fontWeight = FontWeight.SemiBold)
                if (error.isNotBlank()) Text(error, color = MaterialTheme.colorScheme.error)
            }
        }
        item { Text("Հարցերի քանակը", fontWeight = FontWeight.SemiBold) }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(10, 20, 40).forEach { n ->
                    FilterChip(selected = count == n, onClick = { count = n }, label = { Text(n.toString()) })
                }
            }
            val guideSize = examCounts[selected] ?: 70
            OutlinedButton(
                onClick = { count = guideSize },
                modifier = Modifier.fillMaxWidth()
            ) { Text("Ընտրել " + guideSize + " հարց (միայն փորձնական)") }
        }
        item {
            Button(
                enabled = !isLoading && pool.isNotEmpty(),
                onClick = { onStart(selected, pool, count.coerceAtMost(pool.size), "Փորձնական թեստ") },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Սկսել թեստը՝ " + count.coerceAtMost(pool.size) + " հարց")
            }
        }
    }
}

@Composable
fun NativeGames(repository: QuestionRepository, onStart: (String, List<StudyQuestion>, Int, String) -> Unit) {
    var selected by remember { mutableStateOf(BookCatalog.subjects.first()) }
    var mode by remember { mutableStateOf("quiz") }
    var questions by remember { mutableStateOf<List<StudyQuestion>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var flipIndex by remember { mutableIntStateOf(0) }
    var revealed by remember { mutableStateOf(false) }
    LaunchedEffect(selected) {
        loading = true
        val result = mutableListOf<StudyQuestion>()
        try {
            for (book in BookCatalog.books.filter { it.subject == selected })
                result += repository.load(book).allQuestions
        } catch (_: Exception) { /* show empty state */ }
        questions = result.shuffled()
        flipIndex = 0; revealed = false
        loading = false
    }

    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Մինի խաղեր", fontWeight = FontWeight.Bold, fontSize = 25.sp)
            Text("Սովորիր խաղալով՝ առանց ինտերնետի։", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            Text("Խաղի տեսակ", fontWeight = FontWeight.SemiBold)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = mode == "quiz", onClick = { mode = "quiz" }, label = { Text("Արագ հարցեր") })
                FilterChip(selected = mode == "truth", onClick = { mode = "truth" }, label = { Text("Ճիշտ/սխալ") })
                FilterChip(selected = mode == "cards", onClick = { mode = "cards" }, label = { Text("Քարտեր") })
            }
        }
        item { Text("Առարկան", fontWeight = FontWeight.SemiBold) }
        items(BookCatalog.subjects) { s ->
            FilterChip(selected = selected == s, onClick = { selected = s }, label = { Text(s) })
        }
        item {
            HorizontalDivider()
            if (loading) LinearProgressIndicator(Modifier.fillMaxWidth())
            else Text("Հարցեր՝ " + questions.size)
        }
        if (mode == "cards" && questions.isNotEmpty()) {
            item {
                val q = questions[flipIndex % questions.size]
                ElevatedCard(
                    modifier = Modifier.fillMaxWidth().clickable { revealed = !revealed },
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Column(Modifier.fillMaxWidth().padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Քարտ " + (flipIndex % questions.size + 1) + " / " + questions.size,
                            color = MaterialTheme.colorScheme.primary)
                        Text(if (revealed) q.choices[q.correctIndex] else q.stem,
                            fontWeight = FontWeight.SemiBold, fontSize = 20.sp)
                        Text(if (revealed) "Պատասխան" else "Սեղմիր քարտը՝ պատասխանը տեսնելու",
                            color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                    }
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = { flipIndex = (flipIndex - 1 + questions.size) % questions.size; revealed = false },
                        modifier = Modifier.weight(1f)
                    ) { Text("Նախորդ") }
                    Button(
                        onClick = { flipIndex = (flipIndex + 1) % questions.size; revealed = false },
                        modifier = Modifier.weight(1f)
                    ) { Text("Հաջորդ") }
                }
            }
        } else if (questions.isNotEmpty()) {
            item {
                Button(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        val pool = if (mode == "truth") {
                            questions.filter { it.choices.size >= 2 }.mapIndexed { index, q ->
                                val isTrue = (index % 2 == 0)
                                val proposed = if (isTrue) q.correctIndex
                                               else q.choices.indices.first { it != q.correctIndex }
                                q.copy(
                                    stem = q.stem + "\n\n" + q.choices[proposed],
                                    choices = listOf("Ճիշտ է", "Սխալ է"),
                                    correctIndex = if (isTrue) 0 else 1,
                                    explanation = "Ճիշտ պատասխանը՝ " + q.choices[q.correctIndex]
                                )
                            }
                        } else questions
                        onStart(selected, pool, 10, if (mode == "truth") "Ճիշտ / սխալ" else "Մինի խաղ · Արագ հարցեր")
                    }
                ) { Text(if (mode == "truth") "Սկսել ճիշտ/սխալ խաղը" else "Սկսել 10 հարցանոց խաղը") }
            }
        } else if (!loading) {
            item { Text("Այս առարկայի խաղային հարցաշարը դեռ հասանելի չէ։") }
        }
    }
}

@Composable
fun NativeTools(
    repository: QuestionRepository,
    onStart: (String, List<StudyQuestion>, Int, String) -> Unit
) {
    var tool by remember { mutableStateOf("menu") }
    var number by remember { mutableStateOf("10") }
    var subject by remember { mutableStateOf(BookCatalog.subjects.first()) }
    var sections by remember { mutableStateOf<List<StudySection>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var selectedSection by remember { mutableStateOf("Բոլոր բաժինները") }

    LaunchedEffect(subject) {
        loading = true
        val result = mutableListOf<StudySection>()
        try {
            for (book in BookCatalog.books.filter { it.subject == subject }) {
                val loaded = repository.load(book)
                result += loaded.sections.map { sec ->
                    sec.copy(title = book.title + " · " + sec.title)
                }
            }
        } catch (_: Exception) { /* empty state */ }
        sections = result
        selectedSection = "Բոլոր բաժինները"
        loading = false
    }

    if (tool == "vocab" || tool == "calc") {
        Column(Modifier.fillMaxSize()) {
            TextButton(onClick = { tool = "menu" }) { Text("‹ Ուսումնական գործիքներ") }
            Box(Modifier.weight(1f)) {
                if (tool == "vocab") NativeVocabulary() else NativeCalculator()
            }
        }
        return
    }
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Ուսումնական գործիքներ", fontSize = 25.sp, fontWeight = FontWeight.Bold)
            Text("Կազմիր թեմատիկ և ամփոփիչ աշխատանքներ։", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = tool == "menu", onClick = { tool = "menu" }, label = { Text("Ընդհանուր") })
                FilterChip(selected = tool == "theme", onClick = { tool = "theme" }, label = { Text("Թեմատիկ") })
                FilterChip(selected = tool == "summary", onClick = { tool = "summary" }, label = { Text("Ամփոփիչ") })
            }
        }
        if (tool == "menu") {
            item {
                ElevatedCard(Modifier.fillMaxWidth().clickable { tool = "theme" }) {
                    Column(Modifier.padding(18.dp)) {
                        Text("Թեմատիկ աշխատանք", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Ընտրիր առարկան ու թեման, որոշիր հարցերի քանակը։")
                    }
                }
            }
            item {
                ElevatedCard(Modifier.fillMaxWidth().clickable { tool = "summary" }) {
                    Column(Modifier.padding(18.dp)) {
                        Text("Ամփոփիչ աշխատանք", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Պատահական հարցեր՝ ընտրված առարկայի տարբեր բաժիններից։")
                    }
                }
            }
            item {
                ElevatedCard(Modifier.fillMaxWidth().clickable { tool = "vocab" }) {
                    Column(Modifier.padding(18.dp)) {
                        Text("Իմ բառապաշարը · 8393 բառ", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Անգլերեն–հայերեն բառարան, սիրելի բառեր և անձնական ցանկ։")
                    }
                }
            }
            item {
                ElevatedCard(Modifier.fillMaxWidth().clickable { tool = "calc" }) {
                    Column(Modifier.padding(18.dp)) {
                        Text("Հաշվիչ", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Հիմնական և գիտական գործողություններ։")
                    }
                }
            }
            item {
                Text("Նշում. սա հարցերի թվային կազմիչ է։ Տպելու և PDF արտահանման հնարավորությունը դեռ հասանելի չէ։",
                    color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
            }
        } else {
            item { Text("Առարկա", fontWeight = FontWeight.SemiBold) }
            items(BookCatalog.subjects) { s ->
                FilterChip(selected = subject == s, onClick = { subject = s }, label = { Text(s) })
            }
            if (tool == "theme") {
                item { Text("Թեմա", fontWeight = FontWeight.SemiBold) }
                item {
                    FilterChip(
                        selected = selectedSection == "Բոլոր բաժինները",
                        onClick = { selectedSection = "Բոլոր բաժինները" },
                        label = { Text("Բոլոր բաժինները") }
                    )
                }
                items(sections) { s ->
                    FilterChip(
                        selected = selectedSection == s.title,
                        onClick = { selectedSection = s.title },
                        label = { Text(s.title) }
                    )
                }
            }
            item {
                OutlinedTextField(
                    value = number,
                    onValueChange = { input -> number = input.filter { it.isDigit() }.take(3) },
                    label = { Text("Հարցերի քանակը (1–60)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            item {
                val validCount = (number.toIntOrNull() ?: 0) in 1..60
                val pool = if (tool == "theme" && selectedSection != "Բոլոր բաժինները") {
                    sections.firstOrNull { it.title == selectedSection }?.questions.orEmpty()
                } else sections.flatMap { it.questions }
                if (loading) LinearProgressIndicator(Modifier.fillMaxWidth())
                Text("Հասանելի հարցեր՝ " + pool.size)
                Button(
                    enabled = !loading && validCount && pool.isNotEmpty(),
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        onStart(subject, pool, number.toInt().coerceAtMost(pool.size),
                            if (tool == "theme") "Թեմատիկ աշխատանք" else "Ամփոփիչ աշխատանք")
                    }
                ) { Text("Ստեղծել և սկսել") }
                if (validCount && pool.size < (number.toIntOrNull() ?: 0)) {
                    Text("Առկա են ավելի քիչ հարցեր, ուստի կօգտագործվեն միայն հասանելիները։",
                        fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}
