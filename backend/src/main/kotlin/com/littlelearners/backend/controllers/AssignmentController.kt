package com.littlelearners.backend.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.littlelearners.backend.dto.AssignmentRequest
import com.littlelearners.backend.dto.AssignmentResponse
import com.littlelearners.backend.services.AssignmentService
import com.littlelearners.backend.services.UserService
import jakarta.persistence.EntityNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

@RestController
@RequestMapping("/api/assignments")
class AssignmentController(
    private val assignmentService: AssignmentService,
    private val userService: UserService,
    private val objectMapper: ObjectMapper
) {


    @PostMapping("/upload-file")
    fun uploadAssignmentFile(
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Any> {
        return try {
            val uploadDir = "uploads/assignments"
            val path = Paths.get(uploadDir)
            if (!Files.exists(path)) {
                Files.createDirectories(path)
            }

            val fileName = file.originalFilename ?: "file-${System.currentTimeMillis()}"
            val targetPath = path.resolve(fileName)
            Files.copy(file.inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING)

            ResponseEntity.ok(mapOf("fileUrl" to "$uploadDir/$fileName"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "File upload failed: ${e.message}"))
        }
    }

    @PostMapping
    fun createAssignment(@RequestBody request: AssignmentRequest): ResponseEntity<Any> {
        return try {
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
                assignedStudentIds = request.assignedStudentIds
            )
            ResponseEntity.status(HttpStatus.CREATED).body(response)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to create assignment: ${e.message}"))
        }
    }

    @GetMapping("/teacher/{firebaseUid}")
    fun getAssignmentsByTeacher(@PathVariable firebaseUid: String): ResponseEntity<Any> {
        return try {
            val teacher = userService.findByFirebaseUid(firebaseUid)
                ?: throw EntityNotFoundException("Teacher with Firebase UID $firebaseUid not found")

            val assignments = assignmentService.getAssignmentsByTeacherId(teacher.id!!)

            val responses = assignments.map { assignment ->
                AssignmentResponse(
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
                    assignedStudentIds = assignment.assignedStudentIds?.let {
                        objectMapper.readValue(it, Array<UUID>::class.java).toList()
                    }
                )
            }
            ResponseEntity.ok(responses)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to fetch assignments: ${e.message}"))
        }
    }

    @PutMapping("/{id}")
    fun updateAssignment(@PathVariable id: UUID, @RequestBody request: AssignmentRequest): ResponseEntity<Any> {
        return try {
            val teacher = userService.findByFirebaseUid(request.firebaseUid)
                ?: throw EntityNotFoundException("Teacher with Firebase UID ${request.firebaseUid} not found")

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
                assignedStudentIds = request.assignedStudentIds
            )
            ResponseEntity.ok(response)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to update assignment: ${e.message}"))
        }
    }

    @DeleteMapping("/{id}")
    fun deleteAssignment(@PathVariable id: UUID): ResponseEntity<Any> {
        return try {
            assignmentService.deleteAssignment(id)
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to delete assignment: ${e.message}"))
        }
    }
}