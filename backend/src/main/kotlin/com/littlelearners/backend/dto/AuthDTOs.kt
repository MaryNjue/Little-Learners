package com.littlelearners.backend.dto

import com.littlelearners.backend.models.UserRole
import java.util.UUID

// --- Authentication and User DTOs ---

data class UserRegistrationRequest(
    val username: String,
    val password: String,
    val role: UserRole
)

data class UserLoginRequest(
    val username: String,
    val password: String
)

data class UserResponse(
    val id: UUID,
    val username: String,
    val role: UserRole
)

data class LoginResponse(
    val userId: UUID,
    val username: String,
    val role: UserRole,
    val message: String = "Login successful"
    // In a real application, you'd include a JWT token here
)