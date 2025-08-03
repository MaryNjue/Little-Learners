package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.StudentAssignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StudentAssignmentRepository : JpaRepository<StudentAssignment, UUID> {
    // Find all assignments for a specific student
    fun findByStudentId(studentId: UUID): List<StudentAssignment>

    // Find a specific student's assignment record by student and assignment IDs
    fun findByStudentIdAndAssignmentId(studentId: UUID, assignmentId: UUID): StudentAssignment?
}