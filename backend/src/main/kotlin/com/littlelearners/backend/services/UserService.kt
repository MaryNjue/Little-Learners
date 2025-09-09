package com.littlelearners.backend.services

import com.littlelearners.backend.dto.UserLoginRequest
import com.littlelearners.backend.dto.LoginResponse
import com.littlelearners.backend.models.User
import com.littlelearners.backend.models.UserRole
import com.littlelearners.backend.repositories.UserRepository
import com.littlelearners.backend.repositories.StudentRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val studentRepository: StudentRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun registerOrUpdateUser(
        username: String,
        email: String?,
        firebaseUid: String?,
        role: UserRole,
        password: String
    ): User {
        val existingUser = firebaseUid?.let { userRepository.findByFirebaseUid(it) }
        if (existingUser != null) {
            existingUser.username = username
            existingUser.email = email
            existingUser.role = role
            existingUser.passwordHash = passwordEncoder.encode(password)
            return userRepository.save(existingUser)
        }

        val newUser = User(
            username = username,
            email = email,
            regNum = null,
            passwordHash = passwordEncoder.encode(password),
            firebaseUid = firebaseUid,
            role = role
        )
        return userRepository.save(newUser)
    }

    fun authenticateUser(loginRequest: UserLoginRequest): LoginResponse {
        val user = userRepository.findByUsername(loginRequest.username)
            ?: throw IllegalArgumentException("User with username '${loginRequest.username}' not found.")

        if (!passwordEncoder.matches(loginRequest.password, user.passwordHash)) {
            throw IllegalArgumentException("Invalid username or password.")
        }

        // ✅ If student, fetch fullName from students table
        var studentFullName: String? = null
        if (user.role == UserRole.STUDENT) {
            val student = studentRepository.findByUserId(user.id)
            studentFullName = student?.fullName
        }

        return LoginResponse(
            userId = user.id,
            username = user.username,
            role = user.role,
            fullName = studentFullName,
            message = "Login successful"
        )
    }

    fun findByUsername(username: String): User? =
        userRepository.findByUsername(username)

    fun findById(id: UUID): User? =
        userRepository.findById(id).orElse(null)

    fun findByFirebaseUid(firebaseUid: String): User? =
        userRepository.findByFirebaseUid(firebaseUid)

    fun getAllTeachers(): List<User> =
        userRepository.findAll().filter { it.role == UserRole.TEACHER }
}
