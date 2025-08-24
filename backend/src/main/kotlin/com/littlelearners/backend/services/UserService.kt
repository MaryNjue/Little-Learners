package com.littlelearners.backend.services

import com.littlelearners.backend.models.User
import com.littlelearners.backend.models.UserRole
import com.littlelearners.backend.repositories.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun registerOrUpdateUser(
        username: String,
        email: String?,
        firebaseUid: String?,
        role: UserRole,
        passwordHash: String
    ): User {
        val existingUser = firebaseUid?.let { userRepository.findByFirebaseUid(it) }
        if (existingUser != null) {
            existingUser.username = username
            existingUser.email = email
            existingUser.role = role
            existingUser.passwordHash = passwordHash
            return userRepository.save(existingUser)
        }

        val newUser = User(
            username = username,
            email = email,
            regNum = null,
            passwordHash = passwordHash,
            firebaseUid = firebaseUid,
            role = role
        )
        return userRepository.save(newUser)
    }

    fun authenticateUser(username: String, password: String): User {
        val user = userRepository.findByUsername(username)
            ?: throw IllegalArgumentException("User with username '$username' not found.")

        if (passwordEncoder.matches(password, user.passwordHash)) {
            return user
        } else {
            throw IllegalArgumentException("Invalid username or password.")
        }
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
