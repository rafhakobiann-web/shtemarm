package am.shtemarm.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL

private val books = linkedMapOf(
    "Անգլերեն" to listOf("book1.json","book2.json","book3.json"),
    "Հայոց լեզու" to listOf("armenian-book1.json"),
    "Հայոց պատմություն" to listOf("history-book1.json","history-book2.json","history-book3.json"),
    "Կենսաբանություն" to listOf("bio-book1.json","bio-book2.json"),
    "Ֆիզիկա" to listOf("physics-book1.json","physics-book2.json"),
    "Քիմիա" to listOf("original-chemistry.json"),
    "Ռուսերեն" to listOf("original-russian.json"),
    "Աշխարհագրություն" to listOf("original-geography.json")
)
private data class Question(val text:String,val options:List<String>,val answer:Int)
private suspend fun loadQuestions(file:String):List<Question> = withContext(Dispatchers.IO) {
    try {
        val connection = URL("https://shtemarm.lovable.app/data/$file").openConnection()
        connection.connectTimeout=12000
        connection.readTimeout=12000
        val root=JSONObject(connection.getInputStream().bufferedReader().use { it.readText() })
        val result=mutableListOf<Question>()
        val sections=root.optJSONArray("sections") ?: return@withContext result
        for (i in 0 until sections.length()) {
            val units=sections.optJSONObject(i)?.optJSONArray("units") ?: continue
            for (j in 0 until units.length()) {
                val unit=units.optJSONObject(j) ?: continue
                if(unit.optString("kind")!="mc" || unit.optString("passage").isNotBlank()) continue
                val qs=unit.optJSONArray("questions") ?: continue
                for(k in 0 until qs.length()) {
                    val q=qs.optJSONObject(k) ?: continue
                    val options=q.optJSONObject("options") ?: continue
                    val choices=(1..4).map { options.optString(it.toString()) }
                    val answer=q.optString("answer").toIntOrNull() ?: continue
                    val prompt=q.optString("stem")
                    if(prompt.isNotBlank() && answer in 1..4 && choices.all { it.isNotBlank() } && choices.distinct().size==4)
                        result.add(Question(prompt,choices,answer-1))
                }
            }
        }
        result
    } catch (_:Exception) { emptyList() }
}
class MainActivity:ComponentActivity() {
    override fun onCreate(savedInstanceState:Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme(colorScheme=lightColorScheme(primary=Color(0xFF2563EB))) { NativeApp() } }
    }
}
@Composable private fun NativeApp() {
    var screen by remember { mutableStateOf("home") }
    var subject by remember { mutableStateOf("Անգլերեն") }
    var filename by remember { mutableStateOf("") }
    var questions by remember { mutableStateOf<List<Question>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var index by remember { mutableIntStateOf(0) }
    var chosen by remember { mutableIntStateOf(-1) }
    var score by remember { mutableIntStateOf(0) }
    fun back() { screen=when(screen) { "quiz"->"books";"books"->"subjects";else->"home" } }
    BackHandler(screen!="home") { back() }
    LaunchedEffect(filename) {
        if(filename.isNotEmpty()) {
            loading=true
            questions=loadQuestions(filename).shuffled()
            index=0;chosen=-1;score=0
            loading=false
        }
    }
    Scaffold(topBar={
        Surface(shadowElevation=3.dp) {
            Row(Modifier.fillMaxWidth().padding(12.dp)) {
                if(screen!="home") TextButton(onClick={back()}) { Text("‹ Հետ") }
                Text("Shtemarm",Modifier.padding(10.dp),fontWeight=FontWeight.Bold,fontSize=23.sp,color=Color(0xFF2563EB))
            }
        }
    },bottomBar={
        NavigationBar {
            NavigationBarItem(selected=screen=="home",onClick={screen="home"},icon={Text("⌂")},label={Text("Գլխավոր")})
            NavigationBarItem(selected=screen!="home",onClick={screen="subjects"},icon={Text("▤")},label={Text("Առարկաներ")})
        }
    }) { insets ->
        Column(Modifier.fillMaxSize().padding(insets).padding(16.dp)) {
            when(screen) {
                "home" -> {
                    Text("Սովորիր Shtemarm-ի հետ",fontSize=27.sp,fontWeight=FontWeight.Bold)
                    Spacer(Modifier.height(14.dp))
                    Text("Native Android · Քննությունների պատրաստություն")
                    Spacer(Modifier.height(24.dp))
                    Button(onClick={screen="subjects"},modifier=Modifier.fillMaxWidth()) { Text("Ընտրել առարկա") }
                }
                "subjects" -> {
                    Text("Առարկաներ",fontSize=25.sp,fontWeight=FontWeight.Bold)
                    LazyColumn(verticalArrangement=Arrangement.spacedBy(10.dp)) {
                        items(books.keys.toList()) { name ->
                            Card(Modifier.fillMaxWidth().clickable { subject=name;screen="books" }) {
                                Text(name,Modifier.padding(20.dp),fontSize=18.sp)
                            }
                        }
                    }
                }
                "books" -> {
                    Text(subject,fontSize=24.sp,fontWeight=FontWeight.Bold)
                    books[subject].orEmpty().forEachIndexed { n,file ->
                        Card(Modifier.fillMaxWidth().padding(top=12.dp).clickable { filename=file;screen="quiz" }) {
                            Text("Շտեմարան "+(n+1),Modifier.padding(20.dp),fontSize=18.sp)
                        }
                    }
                }
                "quiz" -> {
                    if(loading) { CircularProgressIndicator();Text("Բեռնվում է…") }
                    else if(questions.isEmpty()) {
                        Text("Հարցերը չբեռնվեցին։ Ստուգիր ինտերնետը։")
                        Button(onClick={filename="";screen="books"}) { Text("Վերադառնալ") }
                    } else if(index>=questions.size) {
                        Text("Ավարտվեց",fontSize=26.sp,fontWeight=FontWeight.Bold)
                        Text("Արդյունք՝ "+score+" / "+questions.size)
                        Button(onClick={questions=questions.shuffled();index=0;chosen=-1;score=0}) { Text("Կրկին խաղալ") }
                    } else {
                        val q=questions[index]
                        Text("Հարց "+(index+1)+" / "+questions.size)
                        LinearProgressIndicator(progress={ (index+1).toFloat()/questions.size },modifier=Modifier.fillMaxWidth())
                        Spacer(Modifier.height(16.dp))
                        Text(q.text,fontSize=20.sp,fontWeight=FontWeight.SemiBold)
                        Spacer(Modifier.height(14.dp))
                        q.options.forEachIndexed { n,option ->
                            val bg=if(chosen>=0 && n==q.answer) Color(0xFFD1FAE5)
                                else if(chosen==n) Color(0xFFFEE2E2) else Color(0xFFF3F4F6)
                            Card(Modifier.fillMaxWidth().padding(bottom=10.dp).clickable(enabled=chosen<0) {
                                chosen=n
                                if(n==q.answer) score++
                            },colors=CardDefaults.cardColors(containerColor=bg)) {
                                Text(option,Modifier.padding(16.dp))
                            }
                        }
                        if(chosen>=0) Button(onClick={index++;chosen=-1},modifier=Modifier.fillMaxWidth()) { Text("Հաջորդը") }
                    }
                }
            }
        }
    }
}
