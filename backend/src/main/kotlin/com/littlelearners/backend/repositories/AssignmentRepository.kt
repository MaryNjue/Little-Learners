package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.Assignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AssignmentRepository : JpaRepository<Assignment, UUID> {

    fun findByTeacherId(teacherId: UUID): List<Assignment>

    /**
     * Finds assignments assigned to the student.
     * 1. Uses JOIN FETCH to load the 'teacher' eagerly (fixes LazyInitializationException).
     * 2. Logic covers legacy NULL data and correctly saved 'all' assignments.
     */
    @Query("SELECT a FROM Assignment a JOIN FETCH a.teacher WHERE (a.assignedTo = 'all' OR a.assignedTo IS NULL) OR (a.assignedTo = 'specific' AND a.assignedStudentIds LIKE CONCAT('%\"', :studentId, '\"%'))")
    fun findAssignedAssignments(@Param("studentId") studentId: UUID): List<Assignment>
}