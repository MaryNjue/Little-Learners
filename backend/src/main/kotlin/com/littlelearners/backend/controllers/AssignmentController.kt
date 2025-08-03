package com.littlelearners.backend.controllers

import com.littlelearners.backend.dto.AssignmentRequest
import com.littlelearners.backend.dto.AssignmentResponse
import com.littlelearners.backend.services.AssignmentService
import com.littlelearners.backend.services.UserService
import jakarta.persistence.EntityNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/assignments")
class AssignmentController(
    private val assignmentService: AssignmentService,
    private val userService: UserService // To get teacher's username for response DTO
) {

    @PostMapping // Create a new assignment
    fun createAssignment(@RequestBody request: AssignmentRequest): ResponseEntity<Any> {
        return try {
            val assignment = assignmentService.createAssignment(
                title = request.title,
                description = request.description,
                dueDate = request.dueDate,
                teacherId = request.teacherId
            )
            val teacherUsername = userService.findById(request.teacherId)?.username ?: "Unknown Teacher"
            val response = AssignmentResponse(
                id = assignment.id!!,
                title = assignment.title,
                description = assignment.description,
                dueDate = assignment.dueDate,
                teacherId = assignment.teacher.id!!,
                teacherUsername = teacherUsername
            )
            ResponseEntity.status(HttpStatus.CREATED).body(response)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to create assignment: ${e.message}"))
        }
    }

    @GetMapping // Get all assignments
    fun getAllAssignments(): ResponseEntity<List<AssignmentResponse>> {
        val assignments = assignmentService.getAllAssignments().map { assignment ->
            val teacherUsername = userService.findById(assignment.teacher.id!!)?.username ?: "Unknown Teacher"
            AssignmentResponse(
                id = assignment.id!!,
                title = assignment.title,
                description = assignment.description,
                dueDate = assignment.dueDate,
                teacherId = assignment.teacher.id!!,
                teacherUsername = teacherUsername
            )
        }
        return ResponseEntity.ok(assignments)
    }

    @GetMapping("/{id}") // Get assignment by ID
    fun getAssignmentById(@PathVariable id: UUID): ResponseEntity<Any> {
        val assignment = assignmentService.getAssignmentById(id)
        return if (assignment != null) {
            val teacherUsername = userService.findById(assignment.teacher.id!!)?.username ?: "Unknown Teacher"
            val response = AssignmentResponse(
                id = assignment.id!!,
                title = assignment.title,
                description = assignment.description,
                dueDate = assignment.dueDate,
                teacherId = assignment.teacher.id!!,
                teacherUsername = teacherUsername
            )
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to "Assignment not found with ID: $id"))
        }
    }

    @GetMapping("/by-teacher/{teacherId}") // Get assignments by teacher ID
    fun getAssignmentsByTeacherId(@PathVariable teacherId: UUID): ResponseEntity<List<AssignmentResponse>> {
        val assignments = assignmentService.getAssignmentsByTeacherId(teacherId).map { assignment ->
            val teacherUsername = userService.findById(assignment.teacher.id!!)?.username ?: "Unknown Teacher"
            AssignmentResponse(
                id = assignment.id!!,
                title = assignment.title,
                description = assignment.description,
                dueDate = assignment.dueDate,
                teacherId = assignment.teacher.id!!,
                teacherUsername = teacherUsername
            )
        }
        return ResponseEntity.ok(assignments)
    }

    @PutMapping("/{id}") // Update an existing assignment
    fun updateAssignment(@PathVariable id: UUID, @RequestBody request: AssignmentRequest): ResponseEntity<Any> {
        return try {
            val updatedAssignment = assignmentService.updateAssignment(
                id = id,
                title = request.title,
                description = request.description,
                dueDate = request.dueDate,
                teacherId = request.teacherId // Still passed to ensure teacher existence validation
            )
            val teacherUsername = userService.findById(updatedAssignment.teacher.id!!)?.username ?: "Unknown Teacher"
            val response = AssignmentResponse(
                id = updatedAssignment.id!!,
                title = updatedAssignment.title,
                description = updatedAssignment.description,
                dueDate = updatedAssignment.dueDate,
                teacherId = updatedAssignment.teacher.id!!,
                teacherUsername = teacherUsername
            )
            ResponseEntity.ok(response)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to update assignment: ${e.message}"))
        }
    }

    @DeleteMapping("/{id}") // Delete an assignment
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