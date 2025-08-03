package com.littlelearners.backend.controllers

import com.littlelearners.backend.dto.StudentRequest
import com.littlelearners.backend.dto.StudentResponse
import com.littlelearners.backend.services.StudentService
import com.littlelearners.backend.services.UserService
import jakarta.persistence.EntityNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/students")
class StudentController(
    private val studentService: StudentService,
    private val userService: UserService // To get teacher's username for response DTO
) {

    @PostMapping // Create a new student
    fun createStudent(@RequestBody request: StudentRequest): ResponseEntity<Any> {
        return try {
            val student = studentService.createStudent(
                fullName = request.fullName,
                regNum = request.regNum,
                grade = request.grade,
                gender = request.gender,
                isActive = request.isActive,
                parentName = request.parentName,
                performanceScore = request.performanceScore,
                teacherId = request.teacherId
            )
            val teacherUsername = userService.findById(request.teacherId)?.username ?: "Unknown Teacher"
            val response = StudentResponse(
                id = student.id!!,
                fullName = student.fullName,
                regNum = student.regNum,
                grade = student.grade,
                gender = student.gender,
                isActive = student.isActive,
                parentName = student.parentName,
                performanceScore = student.performanceScore,
                teacherId = student.teacher.id!!,
                teacherUsername = teacherUsername
            )
            ResponseEntity.status(HttpStatus.CREATED).body(response)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to create student: ${e.message}"))
        }
    }

    @GetMapping // Get all students
    fun getAllStudents(): ResponseEntity<List<StudentResponse>> {
        val students = studentService.getAllStudents().map { student ->
            val teacherUsername = userService.findById(student.teacher.id!!)?.username ?: "Unknown Teacher"
            StudentResponse(
                id = student.id!!,
                fullName = student.fullName,
                regNum = student.regNum,
                grade = student.grade,
                gender = student.gender,
                isActive = student.isActive,
                parentName = student.parentName,
                performanceScore = student.performanceScore,
                teacherId = student.teacher.id!!,
                teacherUsername = teacherUsername
            )
        }
        return ResponseEntity.ok(students)
    }

    @GetMapping("/{id}") // Get student by ID
    fun getStudentById(@PathVariable id: UUID): ResponseEntity<Any> {
        val student = studentService.getStudentById(id)
        return if (student != null) {
            val teacherUsername = userService.findById(student.teacher.id!!)?.username ?: "Unknown Teacher"
            val response = StudentResponse(
                id = student.id!!,
                fullName = student.fullName,
                regNum = student.regNum,
                grade = student.grade,
                gender = student.gender,
                isActive = student.isActive,
                parentName = student.parentName,
                performanceScore = student.performanceScore,
                teacherId = student.teacher.id!!,
                teacherUsername = teacherUsername
            )
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to "Student not found with ID: $id"))
        }
    }

    @GetMapping("/by-teacher/{teacherId}") // Get students by teacher ID
    fun getStudentsByTeacherId(@PathVariable teacherId: UUID): ResponseEntity<List<StudentResponse>> {
        val students = studentService.getStudentsByTeacherId(teacherId).map { student ->
            val teacherUsername = userService.findById(student.teacher.id!!)?.username ?: "Unknown Teacher"
            StudentResponse(
                id = student.id!!,
                fullName = student.fullName,
                regNum = student.regNum,
                grade = student.grade,
                gender = student.gender,
                isActive = student.isActive,
                parentName = student.parentName,
                performanceScore = student.performanceScore,
                teacherId = student.teacher.id!!,
                teacherUsername = teacherUsername
            )
        }
        return ResponseEntity.ok(students)
    }

    @PutMapping("/{id}") // Update an existing student
    fun updateStudent(@PathVariable id: UUID, @RequestBody request: StudentRequest): ResponseEntity<Any> {
        return try {
            val updatedStudent = studentService.updateStudent(
                id = id,
                fullName = request.fullName,
                regNum = request.regNum,
                grade = request.grade,
                gender = request.gender,
                isActive = request.isActive,
                parentName = request.parentName,
                performanceScore = request.performanceScore
            )
            val teacherUsername = userService.findById(updatedStudent.teacher.id!!)?.username ?: "Unknown Teacher"
            val response = StudentResponse(
                id = updatedStudent.id!!,
                fullName = updatedStudent.fullName,
                regNum = updatedStudent.regNum,
                grade = updatedStudent.grade,
                gender = updatedStudent.gender,
                isActive = updatedStudent.isActive,
                parentName = updatedStudent.parentName,
                performanceScore = updatedStudent.performanceScore,
                teacherId = updatedStudent.teacher.id!!,
                teacherUsername = teacherUsername
            )
            ResponseEntity.ok(response)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to update student: ${e.message}"))
        }
    }

    @DeleteMapping("/{id}") // Delete a student
    fun deleteStudent(@PathVariable id: UUID): ResponseEntity<Any> {
        return try {
            studentService.deleteStudent(id)
            ResponseEntity.status(HttpStatus.NO_CONTENT).build() // 204 No Content on successful deletion
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to delete student: ${e.message}"))
        }
    }
}