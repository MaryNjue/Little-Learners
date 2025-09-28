package com.littlelearners.backend.controllers

import com.littlelearners.backend.dto.QuestionRequest
import com.littlelearners.backend.dto.QuestionResponse
import com.littlelearners.backend.services.QuestionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/questions")
class QuestionController(
    private val questionService: QuestionService
) {
    @PostMapping
    fun createQuestion(@RequestBody request: QuestionRequest): ResponseEntity<QuestionResponse> {
        val saved = questionService.createQuestion(request)
        return ResponseEntity.ok(questionService.toResponse(saved))
    }

    @GetMapping("/assignment/{assignmentId}")
    fun getQuestionsByAssignment(@PathVariable assignmentId: UUID): ResponseEntity<List<QuestionResponse>> {
        val questions = questionService.getQuestionsByAssignment(assignmentId)
        val responses = questions.map { questionService.toResponse(it) }
        return ResponseEntity.ok(responses)
    }

    @DeleteMapping("/{id}")
    fun deleteQuestion(@PathVariable id: UUID): ResponseEntity<Void> {
        questionService.deleteQuestion(id)
        return ResponseEntity.noContent().build()
    }
}