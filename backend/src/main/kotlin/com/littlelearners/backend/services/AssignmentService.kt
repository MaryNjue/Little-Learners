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
    private val objectMapper: ObjectMapper
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

        val assignment = Assignment(
            title = title,
            description = description,
            dueDate = dueDate,
            teacher = teacher,
            assignedStudentIds = assignedStudentIds?.let { objectMapper.writeValueAsString(it) },
            assignedTo = assignedTo,
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

        existingAssignment.title = title
        existingAssignment.description = description
        existingAssignment.dueDate = dueDate
        existingAssignment.assignedStudentIds = assignedStudentIds?.let { objectMapper.writeValueAsString(it) }
        existingAssignment.assignedTo = assignedTo
        existingAssignment.automatedConfig = automatedConfig
        existingAssignment.fileUrl = fileUrl
        existingAssignment.maxMarks = maxMarks
        existingAssignment.subject = subject

        return assignmentRepository.save(existingAssignment)
    }

    fun deleteAssignment(id: UUID) {
        if (!assignmentRepository.existsById(id)) {
            throw EntityNotFoundException("Assignment with ID $id not found")
        }
        assignmentRepository.deleteById(id)
    }
}