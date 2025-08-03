package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.Assignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AssignmentRepository : JpaRepository<Assignment, UUID> {
    // Find all assignments created by a specific teacher
    fun findByTeacherId(teacherId: UUID): List<Assignment>
}