package com.littlelearners.backend.services

import com.littlelearners.backend.dto.StudentAnswerResponse
import com.littlelearners.backend.models.StudentAnswer
import com.littlelearners.backend.repositories.QuestionRepository
import com.littlelearners.backend.repositories.StudentAnswerRepository
import com.littlelearners.backend.repositories.StudentRepository
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import java.util.*

@Service
class StudentAnswerService(
    private val studentAnswerRepository: StudentAnswerRepository,
    private val studentRepository: StudentRepository,
    private val questionRepository: QuestionRepository
) {

    fun submitAnswer(studentId: UUID, questionId: UUID, chosenAnswer: String): StudentAnswer {
        val student = studentRepository.findById(studentId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Student with ID $studentId not found.")
        }
        val question = questionRepository.findById(questionId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Question with ID $questionId not found.")
        }
        val answer = StudentAnswer(
            student = student,
            question = question,
            chosenAnswer = chosenAnswer,
            isCorrect = question.correctAnswer == chosenAnswer
        )
        return studentAnswerRepository.save(answer)
    }

    fun getAnswersForAssignment(studentId: UUID, assignmentId: UUID): List<StudentAnswer> {
        return studentAnswerRepository.findByStudent_IdAndQuestion_Assignment_Id(studentId, assignmentId)
    }

    fun toResponse(sa: StudentAnswer): StudentAnswerResponse {
        return StudentAnswerResponse(
            id = sa.id,
            chosenAnswer = sa.chosenAnswer,
            isCorrect = sa.isCorrect,
            questionId = sa.question.id,
            studentId = sa.student.id,
            studentName = sa.student.fullName
        )
    }
}