package com.littlelearners.backend.services

import com.littlelearners.backend.models.User
import com.littlelearners.backend.models.UserRole
import com.littlelearners.backend.repositories.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service // Marks this class as a Spring Service component
class UserService(
    private val userRepository: UserRepository
    // Removed passwordEncoder injection, as Firebase handles password hashing
) {

    // This method is for creating/registering a user in your OWN database
    // once they are authenticated via Firebase or for initial setup.
    // It should NOT deal with plain passwords directly.
    fun registerOrUpdateUser(
        username: String,
        email: String, // Assuming email is provided by Firebase auth
        firebaseUid: String,
        role: UserRole
    ): User {
        // Check if a user with this Firebase UID already exists in your DB
        val existingUser = userRepository.findByFirebaseUid(firebaseUid)
        if (existingUser != null) {
            // If user already exists, you might want to update their details or just return
            // For now, let's assume we return the existing user.
            // You might add logic here to update username/email/role if they changed
            existingUser.username = username
            existingUser.email = email
            existingUser.role = role
            return userRepository.save(existingUser)
        }

        // If no user found with that Firebase UID, create a new one
        val newUser = User(
            username = username,
            email = email,
            firebaseUid = firebaseUid,
            role = role
        )
        return userRepository.save(newUser)
    }

    // You can keep findByUsername if you use username as a lookup key
    fun findByUsername(username: String): User? {
        return userRepository.findByUsername(username)
    }

    fun findById(id: UUID): User? {
        return userRepository.findById(id).orElse(null)
    }

    // NEW: Find a user by their Firebase UID
    fun findByFirebaseUid(firebaseUid: String): User? {
        return userRepository.findByFirebaseUid(firebaseUid)
    }

    // Removed isValidUser as Firebase handles password validation

    fun getAllTeachers(): List<User> {
        return userRepository.findAll().filter { it.role == UserRole.TEACHER }
    }
}