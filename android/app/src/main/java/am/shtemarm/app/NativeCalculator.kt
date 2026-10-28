package am.shtemarm.app

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.math.BigDecimal
import kotlin.math.sqrt
import kotlin.math.pow

/** Native arithmetic/scientific calculator with a simple two-operand entry model. */
@Composable
fun NativeCalculator() {
    var display by remember { mutableStateOf("0") }
    var stored by remember { mutableStateOf<Double?>(null) }
    var operator by remember { mutableStateOf("") }
    var replace by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    fun fmt(number: Double): String {
        if (!number.isFinite()) return "Սխալ"
        return try {
            BigDecimal.valueOf(number).stripTrailingZeros().toPlainString()
        } catch (_: Exception) { "Սխալ" }
    }
    fun calculate(a: Double, b: Double, op: String): Double = when (op) {
        "+" -> a + b
        "−" -> a - b
        "×" -> a * b
        "÷" -> a / b
        "^" -> a.pow(b)
        else -> b
    }
    fun press(key: String) {
        error = ""
        when {
            key == "C" -> { display = "0"; stored = null; operator = ""; replace = false }
            key == "⌫" -> { display = if (display.length <= 1) "0" else display.dropLast(1) }
            key in listOf("+", "−", "×", "÷", "^") -> {
                val value = display.toDoubleOrNull()
                if (value != null) {
                    if (stored != null && operator.isNotEmpty() && !replace) {
                        val result = calculate(stored!!, value, operator)
                        display = fmt(result)
                        stored = result
                    } else stored = value
                    operator = key
                    replace = true
                }
            }
            key == "=" -> {
                val a = stored; val b = display.toDoubleOrNull()
                if (a != null && b != null && operator.isNotEmpty()) {
                    val result = calculate(a, b, operator)
                    display = fmt(result)
                    if (!result.isFinite()) error = "Հնարավոր չէ հաշվարկել։"
                }
                stored = null; operator = ""; replace = true
            }
            key == "√" -> {
                val n = display.toDoubleOrNull() ?: return
                val result = sqrt(n)
                display = fmt(result)
                if (!result.isFinite()) error = "Բացասական թվի արմատը իրական չէ։"
                replace = true
            }
            key == "%" -> {
                display = fmt((display.toDoubleOrNull() ?: 0.0) / 100.0)
                replace = true
            }
            key == "+/−" -> {
                display = if (display.startsWith("-")) display.drop(1)
                          else if (display == "0") "0" else "-" + display
            }
            key == "." -> {
                if (replace) { display = "0."; replace = false }
                else if (!display.contains(".")) display += "."
            }
            key.length == 1 && key[0].isDigit() -> {
                display = if (replace || display == "0" || display == "Սխալ") key
                          else (display + key).take(22)
                replace = false
            }
        }
    }
    LazyColumn(
        Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Հաշվիչ", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("Հիմնական և գիտական հաշվարկներ", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        item {
            ElevatedCard(
                Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(
                    Modifier.fillMaxWidth().padding(18.dp),
                    horizontalAlignment = Alignment.End
                ) {
                    Text(if (operator.isBlank()) " " else (stored?.let { fmt(it) } ?: "") + " " + operator,
                        fontSize = 14.sp)
                    Text(display, fontSize = 32.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
                    if (error.isNotBlank()) Text(error, color = MaterialTheme.colorScheme.error)
                }
            }
        }
        items(listOf(
            listOf("C", "⌫", "√", "^"),
            listOf("7", "8", "9", "÷"),
            listOf("4", "5", "6", "×"),
            listOf("1", "2", "3", "−"),
            listOf("+/−", "0", ".", "+"),
            listOf("%", "=")
        ).size) { row ->
            val rows = listOf(
                listOf("C", "⌫", "√", "^"),
                listOf("7", "8", "9", "÷"),
                listOf("4", "5", "6", "×"),
                listOf("1", "2", "3", "−"),
                listOf("+/−", "0", ".", "+"),
                listOf("%", "=")
            )
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                rows[row].forEach { key ->
                    val modifier = Modifier.weight(1f).height(60.dp)
                    if (key == "=") Button(onClick = { press(key) }, modifier = modifier) {
                        Text(key, fontSize = 21.sp)
                    } else OutlinedButton(onClick = { press(key) }, modifier = modifier,
                        contentPadding = PaddingValues(0.dp)) {
                        Text(key, fontSize = if (key == "+/−") 16.sp else 22.sp)
                    }
                }
            }
        }
        item {
            Text("Նշում. երկար տասնորդական հաշվարկներում կարող են առաջանալ կլորացման փոքր սխալներ։",
                fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
