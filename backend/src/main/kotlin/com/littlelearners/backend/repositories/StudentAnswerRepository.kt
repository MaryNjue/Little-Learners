// File: src/main/kotlin/com/littlelearners/backend/repositories/StudentAnswerRepository.kt
package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.StudentAnswer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface StudentAnswerRepository : JpaRepository<StudentAnswer, UUID> {
    fun findByStudent_IdAndQuestion_Assignment_Id(
        studentId: UUID,
        assignmentId: UUID
    ): List<StudentAnswer>
}
