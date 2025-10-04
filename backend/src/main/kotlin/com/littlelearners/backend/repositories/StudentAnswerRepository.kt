// File: src/main/kotlin/com/littlelearners/backend/repositories/StudentAnswerRepository.kt
package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.StudentAnswer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface StudentAnswerRepository : JpaRepository<StudentAnswer, UUID> {

    fun findByStudent_IdAndAssignment_Id(
        studentId: UUID,
        assignmentId: UUID
    ): List<StudentAnswer>

    fun findByAssignment_Id(assignmentId: UUID): List<StudentAnswer>

    fun deleteByQuestion_Id(questionId: UUID)
}
