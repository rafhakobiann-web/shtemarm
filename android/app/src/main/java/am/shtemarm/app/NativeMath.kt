package am.shtemarm.app

import androidx.compose.runtime.Composable

/** Full offline question-text reader for both source Mathematics volumes. */
@Composable
fun NativeMath(bookPart: Int) {
    val sourceBook = StudyBook(
        subject = "Մաթեմատիկա",
        title = "Մաս $bookPart · ամբողջական հարցաշար",
        asset = "math-text-questions.json"
    )
    NativeFullBookReader(sourceBook, onBack = {}, showBack = false)
}
