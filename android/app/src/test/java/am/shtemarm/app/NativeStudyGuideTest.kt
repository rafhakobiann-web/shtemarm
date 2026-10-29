package am.shtemarm.app

import org.junit.Assert.*
import org.junit.Test

class NativeStudyGuideTest {
    @Test fun hasExpandedGrammarTopicsAndMathReference() {
        assertTrue(NativeStudyGuide.grammar.size >= 7)
        assertTrue(NativeStudyGuide.math.size >= 5)
        assertEquals(listOf("hy","en","ru"), NativeStudyGuide.languages)
    }

    @Test fun localizesEachRule() {
        for (rule in NativeStudyGuide.grammar) {
            assertTrue(rule.explanation("hy").length > 20)
            assertTrue(rule.explanation("en").length > 20)
            assertTrue(rule.explanation("ru").length > 20)
        }
    }

    @Test fun detectsExplicitGrammarRuleWithoutReadingPassage() {
        val q = StudyQuestion("q1","Choose the passive voice form",listOf("writes","was written"),1,
            passage="An article about comparative economic growth")
        assertEquals("passive", NativeStudyGuide.ruleFor(q)?.id)
    }

    @Test fun doesNotGuessGrammarFromUnrelatedReadingPassage() {
        val q = StudyQuestion("q2","What is the main idea?",listOf("A","B"),0,
            passage="The passive voice was mentioned in a newspaper")
        assertNull(NativeStudyGuide.ruleFor(q))
        assertTrue(NativeStudyGuide.explanation(q,"Անգլերեն","en").contains("not available"))
    }

    @Test fun respectsExistingVerifiedExplanation() {
        val q = StudyQuestion("q3","Question",listOf("A","B"),0,explanation="Verified source explanation")
        assertEquals("Verified source explanation", NativeStudyGuide.explanation(q,"Անգլերեն","hy"))
    }
}
