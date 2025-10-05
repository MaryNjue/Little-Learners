// src/main/kotlin/com/littlelearners/backend/repositories/StudentAssignmentRepository.kt
package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.StudentAssignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StudentAssignmentRepository : JpaRepository<StudentAssignment, UUID> {

    // Find all assignments for a student
    fun findByStudent_Id(studentId: UUID): List<StudentAssignment>

    // Fetch the single matching student-assignment row (returns the first if duplicates exist)
    fun findFirstByStudent_IdAndAssignment_Id(studentId: UUID, assignmentId: UUID): StudentAssignment?
}
