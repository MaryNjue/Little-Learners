package com.littlelearners.backend.services

import com.littlelearners.backend.models.StudentAssignment
import com.littlelearners.backend.repositories.StudentAssignmentRepository
import com.littlelearners.backend.repositories.StudentRepository
import com.littlelearners.backend.repositories.AssignmentRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class StudentAssignmentService(
    private val studentAssignmentRepository: StudentAssignmentRepository,
    private val studentRepository: StudentRepository,
    private val assignmentRepository: AssignmentRepository
) {
    fun assignStudentToAssignment(
        studentId: UUID,
        assignmentId: UUID,
        completionStatus: String = "PENDING" // Default status
    ): StudentAssignment {
        val student = studentRepository.findById(studentId)
            .orElseThrow { EntityNotFoundException("Student with ID $studentId not found") }
        val assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow { EntityNotFoundException("Assignment with ID $assignmentId not found") }

        // Check if this assignment is already linked to this student
        val existing = studentAssignmentRepository.findByStudentIdAndAssignmentId(studentId, assignmentId)
        if (existing != null) {
            throw IllegalArgumentException("Student ${student.fullName} is already assigned to assignment ${assignment.title}")
        }

        val studentAssignment = StudentAssignment(
            student = student,
            assignment = assignment,
            completionStatus = completionStatus,
            grade = null // <--- ADD THIS LINE to explicitly pass null for grade
        )
        return studentAssignmentRepository.save(studentAssignment)
    }

    fun getStudentAssignmentsForStudent(studentId: UUID): List<StudentAssignment> {
        return studentAssignmentRepository.findByStudentId(studentId)
    }

    fun getStudentAssignmentById(id: UUID): StudentAssignment? {
        return studentAssignmentRepository.findById(id).orElse(null)
    }

    fun updateStudentAssignmentStatus(
        id: UUID,
        newStatus: String,
        grade: Int? = null
    ): StudentAssignment {
        val existingStudentAssignment = studentAssignmentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Student Assignment with ID $id not found") }

        existingStudentAssignment.completionStatus = newStatus
        existingStudentAssignment.grade = grade // Update grade if provided

        return studentAssignmentRepository.save(existingStudentAssignment)
    }

    fun deleteStudentAssignment(id: UUID) {
        if (!studentAssignmentRepository.existsById(id)) {
            throw EntityNotFoundException("Student Assignment with ID $id not found")
        }
        studentAssignmentRepository.deleteById(id)
    }
}