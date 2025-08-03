package com.littlelearners.backend.services

import com.littlelearners.backend.models.Assignment
import com.littlelearners.backend.repositories.AssignmentRepository
import com.littlelearners.backend.repositories.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class AssignmentService(
    private val assignmentRepository: AssignmentRepository,
    private val userRepository: UserRepository // Needed to link assignment to a teacher
) {
    fun createAssignment(
        title: String,
        description: String?,
        dueDate: LocalDate?,
        teacherId: UUID
    ): Assignment {
        val teacher = userRepository.findById(teacherId)
            .orElseThrow { EntityNotFoundException("Teacher with ID $teacherId not found") }

        val assignment = Assignment(
            title = title,
            description = description,
            dueDate = dueDate,
            teacher = teacher
        )
        return assignmentRepository.save(assignment)
    }

    fun getAllAssignments(): List<Assignment> {
        return assignmentRepository.findAll()
    }

    fun getAssignmentById(id: UUID): Assignment? {
        return assignmentRepository.findById(id).orElse(null)
    }

    fun getAssignmentsByTeacherId(teacherId: UUID): List<Assignment> {
        return assignmentRepository.findByTeacherId(teacherId)
    }

    fun updateAssignment(
        id: UUID,
        title: String,
        description: String?,
        dueDate: LocalDate?,
        teacherId: UUID // Even if not changing, ensure teacher still exists/is valid
    ): Assignment {
        val existingAssignment = assignmentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Assignment with ID $id not found") }

        // Verify the teacher exists if it's being updated or just for validation
        userRepository.findById(teacherId)
            .orElseThrow { EntityNotFoundException("Teacher with ID $teacherId not found") }

        existingAssignment.title = title
        existingAssignment.description = description
        existingAssignment.dueDate = dueDate
        // Note: If you want to allow changing the teacher of an assignment, you'd update existingAssignment.teacher here.
        // For now, assuming teacher is set at creation or not changed directly via this update.

        return assignmentRepository.save(existingAssignment)
    }

    fun deleteAssignment(id: UUID) {
        if (!assignmentRepository.existsById(id)) {
            throw EntityNotFoundException("Assignment with ID $id not found")
        }
        assignmentRepository.deleteById(id)
    }
}