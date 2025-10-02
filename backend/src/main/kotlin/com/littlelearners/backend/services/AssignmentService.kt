package com.littlelearners.backend.services

import com.fasterxml.jackson.databind.ObjectMapper
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
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper,
    private val studentAssignmentService: StudentAssignmentService // FIX 1: Inject StudentAssignmentService
) {
    fun createAssignment(
        title: String,
        description: String?,
        dueDate: LocalDate?,
        teacherId: UUID,
        subject: String,
        maxMarks: Int?,
        fileUrl: String?,
        automatedConfig: String?,
        assignedTo: String,
        assignedStudentIds: List<UUID>?
    ): Assignment {
        val teacher = userRepository.findById(teacherId)
            .orElseThrow { EntityNotFoundException("Teacher with ID $teacherId not found") }


        val finalAssignedTo = if (assignedStudentIds.isNullOrEmpty()) {
            "all"
        } else {
            "specific"
        }

        val assignment = Assignment(
            title = title,
            description = description,
            dueDate = dueDate,
            teacher = teacher,
            assignedStudentIds = assignedStudentIds?.let { objectMapper.writeValueAsString(it) },
            assignedTo = finalAssignedTo,
            automatedConfig = automatedConfig,
            fileUrl = fileUrl,
            maxMarks = maxMarks,
            subject = subject
        )
        val savedAssignment = assignmentRepository.save(assignment)

        // CORE FIX: Create StudentAssignment entries immediately upon creation
        if (finalAssignedTo == "specific" && !assignedStudentIds.isNullOrEmpty()) {
            assignedStudentIds.forEach { studentId ->
                try {
                    studentAssignmentService.assignStudentToAssignment(studentId, savedAssignment.id)
                } catch (e: Exception) {
                    println("Warning: Could not assign assignment ${savedAssignment.id} to specific student $studentId: ${e.message}")
                }
            }
        }
        // If 'assignedTo' can be "all", fetch all student IDs here and call assignStudentToAssignment.

        return savedAssignment
    }

    fun getAssignmentsByTeacherId(teacherId: UUID): List<Assignment> {
        return assignmentRepository.findByTeacherId(teacherId)
    }

    fun updateAssignment(
        id: UUID,
        title: String,
        description: String?,
        dueDate: LocalDate?,
        teacherId: UUID,
        subject: String,
        maxMarks: Int?,
        fileUrl: String?,
        automatedConfig: String?,
        assignedTo: String,
        assignedStudentIds: List<UUID>?
    ): Assignment {
        val existingAssignment = assignmentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Assignment with ID $id not found") }

        userRepository.findById(teacherId)
            .orElseThrow { EntityNotFoundException("Teacher with ID $teacherId not found") }

        val finalAssignedTo = if (assignedStudentIds.isNullOrEmpty()) {
            "all"
        } else {
            "specific"
        }

        existingAssignment.title = title
        existingAssignment.description = description
        existingAssignment.dueDate = dueDate
        existingAssignment.assignedStudentIds = assignedStudentIds?.let { objectMapper.writeValueAsString(it) }
        existingAssignment.assignedTo = finalAssignedTo
        existingAssignment.automatedConfig = automatedConfig
        existingAssignment.fileUrl = fileUrl
        existingAssignment.maxMarks = maxMarks
        existingAssignment.subject = subject

        return assignmentRepository.save(existingAssignment)
    }

    fun getAssignmentsForStudent(studentId: UUID): List<Assignment> {
        return assignmentRepository.findAssignedAssignments(studentId)
    }

    fun deleteAssignment(id: UUID) {
        if (!assignmentRepository.existsById(id)) {
            throw EntityNotFoundException("Assignment with ID $id not found")
        }
        assignmentRepository.deleteById(id)
    }

    // Helper function required by AssignmentController to parse IDs
    fun getAssignedStudentIdsAsList(assignedStudentIdsJson: String?): List<UUID>? {
        return assignedStudentIdsJson?.let {
            try {
                objectMapper.readValue(it, object : com.fasterxml.jackson.core.type.TypeReference<List<UUID>>() {})
            } catch (e: Exception) {
                null
            }
        }
    }
}