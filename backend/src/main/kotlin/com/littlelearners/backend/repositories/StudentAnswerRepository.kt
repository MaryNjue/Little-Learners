// src/main/kotlin/com/littlelearners/backend/repositories/StudentAnswerRepository.kt
package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.StudentAnswer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface StudentAnswerRepository : JpaRepository<StudentAnswer, UUID> {

    // All answers a student submitted for a specific assignment
    fun findByStudent_IdAndAssignment_Id(studentId: UUID, assignmentId: UUID): List<StudentAnswer>

    // All answers for a whole assignment (all students)
    fun findByAssignment_Id(assignmentId: UUID): List<StudentAnswer>

    // Delete all answers for a specific question
    fun deleteByQuestion_Id(questionId: UUID)
}
