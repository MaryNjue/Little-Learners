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
    private val userService: UserService
) {

    @PostMapping
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
                teacherFirebaseUid = request.teacherFirebaseUid
            )

            val teacherUsername = userService.findByFirebaseUid(request.teacherFirebaseUid)?.username
                ?: "Unknown Teacher"

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
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to create student: ${e.message}"))
        }
    }

    @GetMapping
    fun getAllStudents(): ResponseEntity<List<StudentResponse>> {
        val students = studentService.getAllStudents()
        val responses = students.map { student ->
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
        return ResponseEntity.ok(responses)
    }

    @GetMapping("/{id}")
    fun getStudentById(@PathVariable id: UUID): ResponseEntity<Any> {
        return try {
            val student = studentService.getStudentById(id)
                ?: throw EntityNotFoundException("Student with ID $id not found")

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
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to retrieve student: ${e.message}"))
        }
    }

    @GetMapping("/teacher/{teacherFirebaseUid}")
    fun getStudentsByTeacherId(@PathVariable teacherFirebaseUid: String): ResponseEntity<Any> {
        return try {
            val teacher = userService.findByFirebaseUid(teacherFirebaseUid)
                ?: throw EntityNotFoundException("Teacher with Firebase UID $teacherFirebaseUid not found")

            val students = studentService.getStudentsByTeacherId(teacher.id!!)
            val responses = students.map { student ->
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
            ResponseEntity.ok(responses)
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to retrieve students: ${e.message}"))
        }
    }

    @PutMapping("/{id}")
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
                performanceScore = request.performanceScore,
                teacherFirebaseUid = request.teacherFirebaseUid
            )

            val teacherUsername = userService.findByFirebaseUid(request.teacherFirebaseUid)?.username
                ?: "Unknown Teacher"

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

    @DeleteMapping("/{id}")
    fun deleteStudent(@PathVariable id: UUID): ResponseEntity<Any> {
        return try {
            studentService.deleteStudent(id)
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        } catch (e: EntityNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Failed to delete student: ${e.message}"))
        }
    }
}