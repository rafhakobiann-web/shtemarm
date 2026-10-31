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
import org.json.JSONArray
import org.json.JSONObject

private data class Word(val english: String, val armenian: String)

@Composable
fun NativeVocabulary() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("shtemarm_vocabulary_native", 0) }
    var allWords by remember { mutableStateOf<List<Word>>(emptyList()) }
    var customWords by remember { mutableStateOf<List<Word>>(emptyList()) }
    var favorites by remember { mutableStateOf<Set<String>>(emptySet()) }
    var search by remember { mutableStateOf("") }
    var savedOnly by remember { mutableStateOf(false) }
    var adding by remember { mutableStateOf(false) }
    var english by remember { mutableStateOf("") }
    var armenian by remember { mutableStateOf("") }
    var ready by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        val words = withContext(Dispatchers.IO) {
            try {
                val raw = context.assets.open("english-armenian-dictionary.json")
                    .bufferedReader(Charsets.UTF_8).use { it.readText() }
                val obj = JSONObject(raw)
                obj.keys().asSequence().map { key -> Word(key, obj.optString(key)) }
                    .filter { it.armenian.isNotBlank() }.toList()
            } catch (_: Exception) { emptyList() }
        }
        allWords = words
        customWords = try {
            val array = JSONArray(prefs.getString("custom_words", "[]") ?: "[]")
            (0 until array.length()).mapNotNull { i ->
                val obj = array.optJSONObject(i) ?: return@mapNotNull null
                Word(obj.optString("en"), obj.optString("hy"))
            }.filter { it.english.isNotBlank() && it.armenian.isNotBlank() }
        } catch (_: Exception) { emptyList() }
        favorites = prefs.getStringSet("favorites", emptySet())?.toSet() ?: emptySet()
        ready = true
    }
    fun saveCustom(newList: List<Word>) {
        customWords = newList
        val array = JSONArray()
        newList.forEach { w -> array.put(JSONObject().put("en", w.english).put("hy", w.armenian)) }
        prefs.edit().putString("custom_words", array.toString()).apply()
    }
    fun toggleFavorite(word: String) {
        favorites = if (word in favorites) favorites - word else favorites + word
        prefs.edit().putStringSet("favorites", favorites).apply()
    }
    val results = remember(search, savedOnly, allWords, customWords, favorites) {
        val query = search.trim().lowercase()
        (customWords + allWords).distinctBy { it.english.lowercase() }
            .filter { w ->
                (!savedOnly || w.english.lowercase() in favorites) &&
                (query.isBlank() || w.english.lowercase().contains(query) ||
                    w.armenian.lowercase().contains(query))
            }.take(75)
    }
    LazyColumn(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text("Անգլերեն–հայերեն բառապաշար", fontWeight = FontWeight.Bold, fontSize = 24.sp)
            Text("Որոնիր բառեր, պահպանիր կամ ավելացրու քո բառերը։",
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            OutlinedTextField(
                value = search, onValueChange = { search = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Որոնել բառը կամ թարգմանությունը") },
                singleLine = true
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = !savedOnly, onClick = { savedOnly = false },
                    label = { Text("Բոլորը") }
                )
                FilterChip(
                    selected = savedOnly, onClick = { savedOnly = true },
                    label = { Text("Պահված (" + favorites.size + ")") }
                )
            }
            Button(onClick = { adding = !adding }, modifier = Modifier.fillMaxWidth()) {
                Text(if (adding) "Փակել" else "+ Ավելացնել սեփական բառ")
            }
        }
        if (adding) {
            item {
                ElevatedCard(shape = RoundedCornerShape(16.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = english, onValueChange = { english = it },
                            label = { Text("Անգլերեն բառ") }, singleLine = true
                        )
                        OutlinedTextField(
                            value = armenian, onValueChange = { armenian = it },
                            label = { Text("Հայերեն թարգմանություն") }
                        )
                        Button(
                            enabled = english.isNotBlank() && armenian.isNotBlank(),
                            onClick = {
                                val word = Word(english.trim(), armenian.trim())
                                saveCustom(listOf(word) + customWords.filterNot {
                                    it.english.equals(word.english, ignoreCase = true)
                                })
                                english = ""; armenian = ""; adding = false
                            }
                        ) { Text("Պահպանել բառը") }
                    }
                }
            }
        }
        item {
            if (!ready) LinearProgressIndicator(Modifier.fillMaxWidth())
            else {
                Text("Բառարանում՝ " + allWords.size + " · Իմ բառերը՝ " + customWords.size,
                    fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                if (results.isEmpty()) Text("Բառեր չեն գտնվել։")
            }
        }
        items(results, key = { it.english.lowercase() }) { word ->
            ElevatedCard(shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.fillMaxWidth().padding(14.dp)) {
                    Column(Modifier.weight(1f)) {
                        Text(word.english, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(4.dp))
                        Text(word.armenian)
                        if (customWords.any { it.english.equals(word.english, ignoreCase = true) }) {
                            TextButton(onClick = {
                                saveCustom(customWords.filterNot { it.english.equals(word.english, ignoreCase = true) })
                            }) { Text("Հեռացնել") }
                        }
                    }
                    TextButton(onClick = { toggleFavorite(word.english.lowercase()) }) {
                        Text(if (word.english.lowercase() in favorites) "★" else "☆", fontSize = 25.sp)
                    }
                }
            }
        }
        if (results.size == 75) item {
            Text("Ցուցադրվում են առաջին 75 արդյունքները։ Նեղացրու որոնումը։",
                fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
