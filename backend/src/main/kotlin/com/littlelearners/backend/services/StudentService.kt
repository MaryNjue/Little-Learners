package com.littlelearners.backend.services

import com.littlelearners.backend.models.Student
import com.littlelearners.backend.models.User
import com.littlelearners.backend.models.UserRole
import com.littlelearners.backend.repositories.StudentRepository
import com.littlelearners.backend.repositories.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class StudentService(
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun createStudent(
        fullName: String,
        regNum: String,
        grade: Int,
        gender: String,
        isActive: Boolean,
        parentName: String?,
        performanceScore: Int?,
        teacherFirebaseUid: String,
        email: String,      // new
        password: String    // new
    ): Student {
        val teacher = userRepository.findByFirebaseUid(teacherFirebaseUid)
            ?: throw EntityNotFoundException("Teacher with Firebase UID $teacherFirebaseUid not found")

        val studentUser = User(
            username = regNum,
            email = email, // use email from request
            regNum = regNum,
            passwordHash = passwordEncoder.encode(password), // use password from request
            firebaseUid = null, // Students not using Firebase
            role = UserRole.STUDENT
        )



        userRepository.save(studentUser)

        val student = Student(
            fullName = fullName,
            regNum = regNum,
            grade = grade,
            gender = gender,
            isActive = isActive,
            parentName = parentName,
            performanceScore = performanceScore,
            user = studentUser,
            teacher = teacher
        )

        return studentRepository.save(student)
    }

    fun getAllStudents(): List<Student> = studentRepository.findAll()

    fun getStudentById(id: UUID): Student? =
        studentRepository.findById(id).orElse(null)

    fun getStudentsByTeacherId(teacherId: UUID): List<Student> =
        studentRepository.findByTeacherId(teacherId)

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

        existingStudent.user.username = regNum
        existingStudent.user.regNum = regNum
        userRepository.save(existingStudent.user)

        return studentRepository.save(existingStudent)
    }

    fun deleteStudent(id: UUID) {
        val student = studentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Student with ID $id not found") }

        studentRepository.delete(student) // user will also be deleted
    }


}

