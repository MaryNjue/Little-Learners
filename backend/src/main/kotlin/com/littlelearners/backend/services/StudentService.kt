package com.littlelearners.backend.services

import com.littlelearners.backend.models.Student
import com.littlelearners.backend.repositories.StudentRepository
import com.littlelearners.backend.repositories.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class StudentService(
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository
) {
    fun createStudent(
        fullName: String,
        regNum: String,
        grade: Int,
        gender: String,
        isActive: Boolean,
        parentName: String?,
        performanceScore: Int?,
        teacherFirebaseUid: String
    ): Student {
        val teacher = userRepository.findByFirebaseUid(teacherFirebaseUid)
            ?: throw EntityNotFoundException("Teacher with Firebase UID $teacherFirebaseUid not found")

        val student = Student(
            fullName = fullName,
            regNum = regNum,
            grade = grade,
            gender = gender,
            isActive = isActive,
            parentName = parentName,
            performanceScore = performanceScore,
            teacher = teacher
        )
        return studentRepository.save(student)
    }

    fun getAllStudents(): List<Student> {
        return studentRepository.findAll()
    }

    fun getStudentById(id: UUID): Student? {
        return studentRepository.findById(id).orElse(null)
    }

    fun getStudentsByTeacherId(teacherId: UUID): List<Student> {
        return studentRepository.findByTeacherId(teacherId)
    }

    fun updateStudent(
        id: UUID,
        fullName: String,
        regNum: String,
        grade: Int,
        gender: String,
        isActive: Boolean,
        parentName: String?,
        performanceScore: Int?,
        teacherFirebaseUid: String
    ): Student {
        val existingStudent = studentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Student with ID $id not found") }

        val teacher = userRepository.findByFirebaseUid(teacherFirebaseUid)
            ?: throw EntityNotFoundException("Teacher with Firebase UID $teacherFirebaseUid not found")

        existingStudent.fullName = fullName
        existingStudent.regNum = regNum
        existingStudent.grade = grade
        existingStudent.gender = gender
        existingStudent.isActive = isActive
        existingStudent.parentName = parentName
        existingStudent.performanceScore = performanceScore
        existingStudent.teacher = teacher

        return studentRepository.save(existingStudent)
    }

    fun deleteStudent(id: UUID) {
        if (!studentRepository.existsById(id)) {
            throw EntityNotFoundException("Student with ID $id not found")
        }
        studentRepository.deleteById(id)
    }
}