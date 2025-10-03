package com.littlelearners.backend.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.littlelearners.backend.models.Assignment
import com.littlelearners.backend.models.StudentAssignment
import com.littlelearners.backend.repositories.AssignmentRepository
import com.littlelearners.backend.repositories.StudentAnswerRepository
import com.littlelearners.backend.repositories.StudentAssignmentRepository
import com.littlelearners.backend.repositories.StudentRepository
import com.littlelearners.backend.repositories.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class AssignmentService(
    private val assignmentRepository: AssignmentRepository,
    private val userRepository: UserRepository,
    private val studentRepository: StudentRepository,
    private val studentAssignmentRepository: StudentAssignmentRepository,
    private val studentAnswerRepository: StudentAnswerRepository,
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

        val finalAssignedTo = if (assignedStudentIds.isNullOrEmpty()) "all" else "specific"

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

        // 🚨 Create StudentAssignment rows automatically
        if (finalAssignedTo == "all") {
            val allStudents = studentRepository.findAll()
            allStudents.forEach { student ->
                val sa = StudentAssignment(
                    student = student,
                    assignment = savedAssignment,
                    completionStatus = "PENDING",
                    grade = null
                )
                studentAssignmentRepository.save(sa)
            }
        } else if (finalAssignedTo == "specific" && assignedStudentIds != null) {
            val students = studentRepository.findAllById(assignedStudentIds)
            students.forEach { student ->
                val sa = StudentAssignment(
                    student = student,
                    assignment = savedAssignment,
                    completionStatus = "PENDING",
                    grade = null
                )
                studentAssignmentRepository.save(sa)
            }
        }

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

        val finalAssignedTo = if (assignedStudentIds.isNullOrEmpty()) "all" else "specific"

        existingAssignment.title = title
        existingAssignment.description = description
        existingAssignment.dueDate = dueDate
        existingAssignment.assignedStudentIds = assignedStudentIds?.let { objectMapper.writeValueAsString(it) }
        existingAssignment.assignedTo = finalAssignedTo
        existingAssignment.automatedConfig = automatedConfig
        existingAssignment.fileUrl = fileUrl
        existingAssignment.maxMarks = maxMarks
        existingAssignment.subject = subject

        val updatedAssignment = assignmentRepository.save(existingAssignment)

        // 🚨 Sync StudentAssignment table
        studentAssignmentRepository.findAll()
            .filter { it.assignment.id == id }
            .forEach { studentAssignmentRepository.delete(it) }

        if (finalAssignedTo == "all") {
            val allStudents = studentRepository.findAll()
            allStudents.forEach { student ->
                val sa = StudentAssignment(
                    student = student,
                    assignment = updatedAssignment,
                    completionStatus = "PENDING",
                    grade = null
                )
                studentAssignmentRepository.save(sa)
            }
        } else if (finalAssignedTo == "specific" && assignedStudentIds != null) {
            val students = studentRepository.findAllById(assignedStudentIds)
            students.forEach { student ->
                val sa = StudentAssignment(
                    student = student,
                    assignment = updatedAssignment,
                    completionStatus = "PENDING",
                    grade = null
                )
                studentAssignmentRepository.save(sa)
            }
        }

        return updatedAssignment
    }

    fun getAssignmentsForStudent(studentId: UUID): List<Assignment> {
        return assignmentRepository.findAssignedAssignments(studentId)
    }

    fun deleteAssignment(id: UUID) {
        val assignment = assignmentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Assignment with ID $id not found") }

        // Delete all answers linked to this assignment's questions
        assignment.questions.forEach { question ->
            studentAnswerRepository.deleteByQuestion_Id(question.id) // <-- use instance, not class
        }

        // Delete related StudentAssignments (cascade is optional if mapped)
        assignment.studentAssignments.forEach { studentAssignmentRepository.delete(it) }

        // Finally, delete the assignment itself
        assignmentRepository.delete(assignment)
    }

}
