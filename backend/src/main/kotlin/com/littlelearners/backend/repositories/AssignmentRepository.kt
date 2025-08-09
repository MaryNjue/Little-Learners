// File: src/main/kotlin/com/littlelearners/backend/repositories/AssignmentRepository.kt
package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.Assignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query // Import for @Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AssignmentRepository : JpaRepository<Assignment, UUID> {
    // Find all assignments created by a specific teacher
    fun findByTeacherId(teacherId: UUID): List<Assignment>

    // Custom query to find assignments where assignedStudentIds (JSON string) contains a specific student UUID
    // This assumes assignedStudentIds is stored as a string that looks like a JSON array, e.g., '["uuid1", "uuid2"]'
    // The ':studentIdString' parameter should be passed like '"<UUID>"' (including quotes).
    @Query(value = "SELECT * FROM assignments a WHERE a.assigned_student_ids LIKE %:studentIdString%", nativeQuery = true)
    fun findByAssignedStudentId(studentIdString: String): List<Assignment>
}