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
    private val objectMapper: ObjectMapper // Used for serializing/deserializing assignedStudentIds
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
            assignedTo = finalAssignedTo, // Use the reliably derived value
            automatedConfig = automatedConfig,
            fileUrl = fileUrl,
            maxMarks = maxMarks,
            subject = subject
        )
        return assignmentRepository.save(assignment)
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

        // 🚨 CRITICAL FIX: Apply the same reliable logic during updates.
        val finalAssignedTo = if (assignedStudentIds.isNullOrEmpty()) {
            "all"
        } else {
            "specific"
        }

        existingAssignment.title = title
        existingAssignment.description = description
        existingAssignment.dueDate = dueDate
        existingAssignment.assignedStudentIds = assignedStudentIds?.let { objectMapper.writeValueAsString(it) }
        existingAssignment.assignedTo = finalAssignedTo // Use the reliably derived value
        existingAssignment.automatedConfig = automatedConfig
        existingAssignment.fileUrl = fileUrl
        existingAssignment.maxMarks = maxMarks
        existingAssignment.subject = subject

        return assignmentRepository.save(existingAssignment)
    }

    fun getAssignmentsForStudent(studentId: UUID): List<Assignment> {
        // This relies on the custom @Query method in AssignmentRepository.kt
        return assignmentRepository.findAssignedAssignments(studentId)
    }


    fun deleteAssignment(id: UUID) {
        if (!assignmentRepository.existsById(id)) {
            throw EntityNotFoundException("Assignment with ID $id not found")
        }
        assignmentRepository.deleteById(id)
    }

    // In AssignmentService.kt

// ... add this function

    fun finalizeStudentAssignment(assignmentId: UUID, studentId: UUID) {
        // 🚨 IMPLEMENTATION REQUIRED:
        // 1. You should verify that all questions for this assignment have a corresponding StudentAnswer entry
        //    for this student.
        // 2. You need a dedicated table/model (e.g., StudentAssignmentStatus) to save the overall status,
        //    grade, and feedback for the student/assignment pair.
        // 3. Update the status in that model to 'SUBMITTED_PENDING_GRADE'.

        // For now, assume success and print a log:
        println("Finalizing assignment $assignmentId for student $studentId.")
    }
}