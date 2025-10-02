package com.littlelearners.backend.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.littlelearners.backend.dto.AssignmentRequest
import com.littlelearners.backend.dto.AssignmentResponse
import com.littlelearners.backend.services.AssignmentService
import com.littlelearners.backend.services.FileUploadService
import com.littlelearners.backend.services.StudentAssignmentService
import com.littlelearners.backend.repositories.StudentAssignmentRepository
import com.littlelearners.backend.services.UserService
import jakarta.persistence.EntityNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.*

@RestController
@RequestMapping("/api/assignments")
class AssignmentController(
    private val assignmentService: AssignmentService,
    private val userService: UserService,
    private val studentAssignmentService: StudentAssignmentService,
    private val studentAssignmentRepository: StudentAssignmentRepository,
    private val objectMapper: ObjectMapper,
    private val fileUploadService: FileUploadService
) {

    // -------------------------------
    // File Upload
    // -------------------------------
    @PostMapping("/upload-file")
    fun uploadAssignmentFile(@RequestParam("file") file: MultipartFile): ResponseEntity<Any> {
        return try {
            // FIXED: Only passing 'file' to avoid "Too many arguments" error.
            val fileUrl = fileUploadService.uploadFile(file)
            ResponseEntity.ok(mapOf("fileUrl" to fileUrl))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "File upload failed: ${e.message}"))
        }
    }

    // -------------------------------
    // Create Assignment
    // -------------------------------
    @PostMapping
    fun createAssignment(@RequestBody request: AssignmentRequest): ResponseEntity<Any> {
        return try {
            // FIXED: Using the correct method 'findByFirebaseUid' from UserService.
            val teacher = userService.findByFirebaseUid(request.firebaseUid)
                ?: throw EntityNotFoundException("Teacher with Firebase UID ${request.firebaseUid} not found")

            val assignment = assignmentService.createAssignment(
                title = request.title,
                description = request.description,
                dueDate = request.dueDate,
                teacherId = teacher.id!!,
                subject = request.subject,
                maxMarks = request.maxMarks,
                fileUrl = request.fileUrl,
                automatedConfig = request.automatedConfig,
                assignedTo = request.assignedTo,
                assignedStudentIds = request.assignedStudentIds
            )

            val response = AssignmentResponse(
                id = assignment.id!!,
                title = assignment.title,
                description = assignment.description,
                dueDate = assignment.dueDate,
                teacherId = assignment.teacher.id!!,
                teacherUsername = teacher.username,
                subject = assignment.subject,
                maxMarks = assignment.maxMarks,
                fileUrl = assignment.fileUrl,
                assignedTo = assignment.assignedTo,
                assignedStudentIds = assignmentService.getAssignedStudentIdsAsList(assignment.assignedStudentIds) // Ensured correct helper usage
            )
            ResponseEntity.status(HttpStatus.CREATED).body(response)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "Failed to create assignment: ${e.message}"))
        }
    }

    // -------------------------------
    // Get assignments by teacher
    // -------------------------------
    @GetMapping("/teacher/{teacherId}")
    fun getAssignmentsByTeacherId(@PathVariable teacherId: UUID): ResponseEntity<List<AssignmentResponse>> {
        val assignments = assignmentService.getAssignmentsByTeacherId(teacherId)
        val responses = assignments.map { assignment ->
            AssignmentResponse(
                id = assignment.id!!,
                title = assignment.title,
                description = assignment.description,
                dueDate = assignment.dueDate,
                teacherId = assignment.teacher.id!!,
                teacherUsername = assignment.teacher.username,
                subject = assignment.subject,
                maxMarks = assignment.maxMarks,
                fileUrl = assignment.fileUrl,
                assignedTo = assignment.assignedTo,
                assignedStudentIds = assignmentService.getAssignedStudentIdsAsList(assignment.assignedStudentIds)
            )
        }
        return ResponseEntity.ok(responses)
    }

    // -------------------------------
    // Get assignments for student
    // -------------------------------
    @GetMapping("/student/{studentId}")
    fun getAssignmentsForStudent(@PathVariable studentId: UUID): ResponseEntity<List<AssignmentResponse>> {
        val assignments = assignmentService.getAssignmentsForStudent(studentId)
        val studentAssignments = studentAssignmentRepository.findByStudentId(studentId).associateBy { it.assignment.id }

        val responses = assignments.map { assignment ->
            val studentAssignment = studentAssignments[assignment.id]
            AssignmentResponse(
                id = assignment.id!!,
                title = assignment.title,
                description = assignment.description,
                dueDate = assignment.dueDate,
                teacherId = assignment.teacher.id!!,
                teacherUsername = assignment.teacher.username,
                subject = assignment.subject,
                maxMarks = assignment.maxMarks,
                fileUrl = assignment.fileUrl,
                assignedTo = assignment.assignedTo,
                assignedStudentIds = assignmentService.getAssignedStudentIdsAsList(assignment.assignedStudentIds),
                status = studentAssignment?.completionStatus,
                grade = studentAssignment?.grade
            )
        }
        return ResponseEntity.ok(responses)
    }

    // -------------------------------
    // Finalize/Submit assignment
    // -------------------------------
    @PutMapping("/{assignmentId}/finalize/student/{studentId}")
    fun finalizeStudentAssignment(
        @PathVariable assignmentId: UUID,
        @PathVariable studentId: UUID
    ): ResponseEntity<Any> {
        return try {
            val finalizedAssignment = studentAssignmentService.finishAssignment(studentId, assignmentId)
            ResponseEntity.ok(mapOf(
                "message" to "Assignment finalized successfully.",
                "status" to finalizedAssignment.completionStatus,
                "grade" to finalizedAssignment.grade
            ))
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "Failed to finalize assignment: ${e.message}"))
        }
    }


    // -------------------------------
    // Update assignment
    // -------------------------------
    @PutMapping("/{id}")
    fun updateAssignment(@PathVariable id: UUID, @RequestBody request: AssignmentRequest): ResponseEntity<Any> {
        return try {
            // FIXED: Using the correct method 'findByFirebaseUid' from UserService.
            val teacher = userService.findByFirebaseUid(request.firebaseUid)
                ?: throw EntityNotFoundException("Teacher not found with firebaseUid: ${request.firebaseUid}")

            val updatedAssignment = assignmentService.updateAssignment(
                id = id,
                title = request.title,
                description = request.description,
                dueDate = request.dueDate,
                teacherId = teacher.id!!,
                subject = request.subject,
                maxMarks = request.maxMarks,
                fileUrl = request.fileUrl,
                automatedConfig = request.automatedConfig,
                assignedTo = request.assignedTo,
                assignedStudentIds = request.assignedStudentIds
            )

            val response = AssignmentResponse(
                id = updatedAssignment.id!!,
                title = updatedAssignment.title,
                description = updatedAssignment.description,
                dueDate = updatedAssignment.dueDate,
                teacherId = updatedAssignment.teacher.id!!,
                teacherUsername = teacher.username,
                subject = updatedAssignment.subject,
                maxMarks = updatedAssignment.maxMarks,
                fileUrl = updatedAssignment.fileUrl,
                assignedTo = updatedAssignment.assignedTo,
                assignedStudentIds = assignmentService.getAssignedStudentIdsAsList(updatedAssignment.assignedStudentIds)
            )
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "Failed to update assignment: ${e.message}"))
        }
    }

    // -------------------------------
    // Delete assignment
    // -------------------------------
    @DeleteMapping("/{id}")
    fun deleteAssignment(@PathVariable id: UUID): ResponseEntity<Any> {
        return try {
            assignmentService.deleteAssignment(id)
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "Failed to delete assignment: ${e.message}"))
        }
    }
}