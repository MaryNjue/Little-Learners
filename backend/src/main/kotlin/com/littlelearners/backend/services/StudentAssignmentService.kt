// src/main/kotlin/com/littlelearners/backend/services/StudentAssignmentService.kt
package com.littlelearners.backend.services

import com.littlelearners.backend.models.StudentAssignment
import com.littlelearners.backend.repositories.StudentAssignmentRepository
import com.littlelearners.backend.repositories.StudentRepository
import com.littlelearners.backend.repositories.AssignmentRepository
import com.littlelearners.backend.repositories.StudentAnswerRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class StudentAssignmentService(
    private val studentAssignmentRepository: StudentAssignmentRepository,
    private val studentRepository: StudentRepository,
    private val assignmentRepository: AssignmentRepository,
    private val studentAnswerRepository: StudentAnswerRepository
) {

    fun assignStudentToAssignment(
        studentId: UUID,
        assignmentId: UUID,
        completionStatus: String = "PENDING"
    ): StudentAssignment {
        val student = studentRepository.findById(studentId)
            .orElseThrow { EntityNotFoundException("Student with ID $studentId not found") }
        val assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow { EntityNotFoundException("Assignment with ID $assignmentId not found") }

        val existing = studentAssignmentRepository.findFirstByStudent_IdAndAssignment_Id(studentId, assignmentId)
        if (existing != null) {
            throw IllegalArgumentException("Student ${student.fullName} is already assigned to assignment ${assignment.title}")
        }

        val studentAssignment = StudentAssignment(
            student = student,
            assignment = assignment,
            completionStatus = completionStatus,
            grade = null
        )
        return studentAssignmentRepository.save(studentAssignment)
    }

    fun getStudentAssignmentsForStudent(studentId: UUID): List<StudentAssignment> {
        return studentAssignmentRepository.findByStudent_Id(studentId)
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
        existingStudentAssignment.grade = grade

        return studentAssignmentRepository.save(existingStudentAssignment)
    }

    fun deleteStudentAssignment(id: UUID) {
        if (!studentAssignmentRepository.existsById(id)) {
            throw EntityNotFoundException("Student Assignment with ID $id not found")
        }
        studentAssignmentRepository.deleteById(id)
    }

    /**
     * Finish assignment: compute score and mark an existing StudentAssignment as COMPLETED.
     * This method will attempt to find an existing StudentAssignment row and UPDATE it.
     * It will not create duplicates unless no such row exists at all (but DB unique constraint should prevent duplicates).
     */
    fun finishAssignment(studentId: UUID, assignmentId: UUID): StudentAssignment {
        val studentAssignment = studentAssignmentRepository.findFirstByStudent_IdAndAssignment_Id(studentId, assignmentId)
            ?: throw EntityNotFoundException("StudentAssignment not found for studentId=$studentId assignmentId=$assignmentId")

        val answers = studentAnswerRepository.findByStudent_IdAndAssignment_Id(studentId, assignmentId)
        val assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow { EntityNotFoundException("Assignment not found with id $assignmentId") }

        val totalQuestions = answers.size
        val correctAnswers = answers.count { it.isCorrect }
        val maxMarks = assignment.maxMarks ?: 100
        val score = if (totalQuestions > 0) (correctAnswers * maxMarks) / totalQuestions else 0

        if (studentAssignment.completionStatus == "COMPLETED") {
            // Already completed - return as-is or throw if you want to block re-finalize attempts
            return studentAssignment
        }

        studentAssignment.completionStatus = "COMPLETED"
        studentAssignment.grade = score

        return studentAssignmentRepository.save(studentAssignment)
    }
}
