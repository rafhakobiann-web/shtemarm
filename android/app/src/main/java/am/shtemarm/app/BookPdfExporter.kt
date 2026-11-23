package am.shtemarm.app

import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import java.io.OutputStream

/**
 * Writes a readable, printable text edition of the questions available to the in-app reader.
 * The caller runs this on Dispatchers.IO and owns/ closes the supplied stream.
 */
internal object BookPdfExporter {
    private const val PAGE_WIDTH = 595
    private const val PAGE_HEIGHT = 842
    private const val MARGIN = 42f
    private const val FOOTER_Y = 812f

    fun write(output: OutputStream, subject: String, title: String, exercises: List<SourceExercise>, includeAnswerKey: Boolean, language: String = "hy") {
        val document = PdfDocument()
        var pageNumber = 0
        var page = newPage(document, ++pageNumber)
        var canvas = page.canvas
        var y = 48f

        val titlePaint = paint(18f, true)
        val subtitlePaint = paint(10f, false, 0xFF52616B.toInt())
        val headingPaint = paint(11f, true, 0xFF12675E.toInt())
        val bodyPaint = paint(11f, false)
        val optionPaint = paint(10f, false)
        val footerPaint = paint(8f, false, 0xFF66737B.toInt())

        fun finishCurrentPage() {
            canvas.drawText("$pageNumber", PAGE_WIDTH - MARGIN - 14f, FOOTER_Y, footerPaint)
            document.finishPage(page)
        }

        fun nextPage() {
            finishCurrentPage()
            page = newPage(document, ++pageNumber)
            canvas = page.canvas
            y = 48f
        }

        fun ensureRoom(required: Float) {
            if (y + required > FOOTER_Y - 16f) nextPage()
        }

        fun drawParagraph(text: String, textPaint: Paint, indent: Float = 0f, gapAfter: Float = 5f) {
            val lines = wrap(text, textPaint, PAGE_WIDTH - 2f * MARGIN - indent)
            val lineHeight = textPaint.textSize * 1.42f
            for (line in lines) {
                if (y + lineHeight > FOOTER_Y - 16f) nextPage()
                if (line.isNotEmpty()) canvas.drawText(line, MARGIN + indent, y, textPaint)
                y += lineHeight
            }
            y += gapAfter
        }

        canvas.drawText(title, MARGIN, y, titlePaint)
        y += 25f
        canvas.drawText(subject, MARGIN, y, subtitlePaint)
        y += 17f
        canvas.drawText(localized(language,
            "${exercises.size} առաջադրանք · Ստեղծված է Shtemarm-ով",
            "${exercises.size} study items · Created by Shtemarm",
            "${exercises.size} заданий · Создано в Shtemarm"), MARGIN, y, subtitlePaint)
        y += 25f

        exercises.forEachIndexed { index, exercise ->
            ensureRoom(70f)
            drawParagraph("${index + 1}. ${exercise.heading}", headingPaint, gapAfter = 4f)
            if (exercise.passage.isNotBlank()) drawParagraph(exercise.passage, bodyPaint, gapAfter = 6f)
            if (exercise.prompt.isNotBlank()) drawParagraph(exercise.prompt, bodyPaint, gapAfter = 6f)
            exercise.options.forEachIndexed { optionIndex, option ->
                drawParagraph("${('A'.code + optionIndex).toChar()}. $option", optionPaint, indent = 12f, gapAfter = 2f)
            }
            if (exercise.visual.isNotBlank()) {
                drawParagraph(localized(language,
                    "Սկզբնաղբյուրում կա պատկեր կամ գծագիր՝ ${exercise.visual}",
                    "Source includes an image or diagram: ${exercise.visual}",
                    "В источнике есть изображение или схема: ${exercise.visual}"), subtitlePaint, gapAfter = 5f)
            }
            y += 8f
        }

        if (includeAnswerKey) {
            nextPage()
            drawParagraph(localized(language, "Պատասխանների բանալի · ${title}", "Answer key · ${title}", "Ответы · ${title}"), titlePaint, gapAfter = 18f)
            exercises.forEachIndexed { index, exercise ->
                val answer = exercise.answer.ifBlank {
                    localized(language, "Աղբյուրում պատասխան նշված չէ", "No answer listed in the source", "В источнике нет ответа")
                }
                drawParagraph("${index + 1}. ${exercise.heading} — $answer", bodyPaint, gapAfter = 5f)
            }
        }

        try {
            finishCurrentPage()
            document.writeTo(output)
        } finally {
            document.close()
        }
    }


    private fun localized(language: String, hy: String, en: String, ru: String): String = when (language.lowercase()) {
        "en" -> en
        "ru" -> ru
        else -> hy
    }

    private fun newPage(document: PdfDocument, number: Int): PdfDocument.Page {
        val info = PdfDocument.PageInfo.Builder(PAGE_WIDTH, PAGE_HEIGHT, number).create()
        return document.startPage(info)
    }

    private fun paint(size: Float, bold: Boolean, color: Int = 0xFF182327.toInt()) = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = size
        typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
        this.color = color
    }

    private fun wrap(text: String, paint: Paint, maxWidth: Float): List<String> {
        val result = ArrayList<String>()
        text.replace('\r', ' ').split('\n').forEach { paragraph ->
            val words = paragraph.trim().split(Regex("\\s+")).filter { it.isNotBlank() }
            if (words.isEmpty()) {
                result.add("")
                return@forEach
            }
            var line = ""
            for (word in words) {
                val candidate = if (line.isEmpty()) word else "$line $word"
                if (paint.measureText(candidate) <= maxWidth) {
                    line = candidate
                } else {
                    if (line.isNotEmpty()) result.add(line)
                    line = word
                }
            }
            if (line.isNotEmpty()) result.add(line)
        }
        return result.ifEmpty { listOf("") }
    }
}
