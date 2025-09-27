package com.littlelearners.backend.controllers

import com.littlelearners.backend.dto.QuestionRequest
import com.littlelearners.backend.dto.QuestionResponse
import com.littlelearners.backend.models.Question
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
    fun getQuestionsByAssignment(@PathVariable assignmentId: UUID): ResponseEntity<List<Question>> {
        return ResponseEntity.ok(questionService.getQuestionsByAssignment(assignmentId))
    }

    @DeleteMapping("/{id}")
    fun deleteQuestion(@PathVariable id: UUID): ResponseEntity<Void> {
        questionService.deleteQuestion(id)
        return ResponseEntity.noContent().build()
    }
}
