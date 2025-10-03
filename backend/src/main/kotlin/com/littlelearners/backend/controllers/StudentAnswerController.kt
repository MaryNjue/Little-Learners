package com.littlelearners.backend.controllers

import com.littlelearners.backend.dto.StudentAnswer
import com.littlelearners.backend.dto.StudentAnswerResponse
import com.littlelearners.backend.repositories.StudentAnswerRepository
import com.littlelearners.backend.services.StudentAnswerService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/answers")
class StudentAnswerController(
    private val studentAnswerService: StudentAnswerService
) {

    // Submit an answer
    @PostMapping
    fun submitAnswer(@RequestBody request: StudentAnswer): ResponseEntity<StudentAnswerResponse> {
        val savedAnswer = studentAnswerService.submitAnswer(
            studentId = request.studentId,
            questionId = request.questionId,
            chosenAnswer = request.chosenAnswer
        )
        val response = studentAnswerService.toResponse(savedAnswer)
        return ResponseEntity.ok(response)
    }

    // Get all answers for a student for a specific assignment
    @GetMapping("/student/{studentId}/assignment/{assignmentId}")
    fun getStudentAnswers(
        @PathVariable studentId: UUID,
        @PathVariable assignmentId: UUID
    ): ResponseEntity<List<StudentAnswerResponse>> {
        val answers = studentAnswerService.getAnswersForAssignment(studentId, assignmentId)
        val responseList = answers.map { studentAnswerService.toResponse(it) }
        return ResponseEntity.ok(responseList)
    }

    // Get all student answers for an assignment (teacher view)
    @GetMapping("/teacher/assignment/{assignmentId}")
    fun getAllStudentAnswersForAssignment(
        @PathVariable assignmentId: UUID
    ): ResponseEntity<List<Map<String, Any>>> {
        val results = studentAnswerService.getAllStudentAnswersForAssignment(assignmentId)
        return ResponseEntity.ok(results)
    }



}
