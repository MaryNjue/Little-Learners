package com.littlelearners.backend.services

import com.littlelearners.backend.dto.QuestionRequest
import com.littlelearners.backend.dto.QuestionResponse
import com.littlelearners.backend.models.Question
import com.littlelearners.backend.repositories.AssignmentRepository
import com.littlelearners.backend.repositories.QuestionRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class QuestionService(
    private val questionRepository: QuestionRepository,
    private val assignmentRepository: AssignmentRepository
) {
    fun createQuestion(request: QuestionRequest): Question {
        val assignment = assignmentRepository.findById(request.assignmentId)
            .orElseThrow { IllegalArgumentException("Assignment not found") }

        val question = Question(
            assignment = assignment,
            questionText = request.questionText,
            options = request.options.joinToString(","), // store as CSV
            correctAnswer = request.correctAnswer
        )
        return questionRepository.save(question)
    }



    fun getQuestionsByAssignment(assignmentId: UUID): List<Question> =
        questionRepository.findByAssignment_Id(assignmentId)



    fun getQuestionById(id: UUID): Question =
        questionRepository.findById(id).orElseThrow()

    fun deleteQuestion(id: UUID) {
        val question = questionRepository.findById(id).orElseThrow()
        questionRepository.delete(question)
    }

    fun toResponse(question: Question) = QuestionResponse(
        id = question.id,
        assignmentId = question.assignment.id,
        questionText = question.questionText,
        options = question.options.split(","),
        correctAnswer = question.correctAnswer
    )
}
