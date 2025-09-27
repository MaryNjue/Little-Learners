
package com.littlelearners.backend.services

import com.littlelearners.backend.dto.StudentAnswerResponse
import com.littlelearners.backend.models.StudentAnswer
import com.littlelearners.backend.repositories.QuestionRepository
import com.littlelearners.backend.repositories.StudentAnswerRepository
import com.littlelearners.backend.repositories.StudentRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class StudentAnswerService(
    private val studentAnswerRepository: StudentAnswerRepository,
    private val studentRepository: StudentRepository,
    private val questionRepository: QuestionRepository
) {

    fun submitAnswer(studentId: UUID, questionId: UUID, chosenAnswer: String): StudentAnswer {
        val student = studentRepository.findById(studentId).orElseThrow()
        val question = questionRepository.findById(questionId).orElseThrow()
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
