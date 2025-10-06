package com.littlelearners.backend.dto

import com.littlelearners.backend.models.UserRole
import java.util.UUID



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
    val message: String = "Login successful",
    val fullName: String? = null,
    val studentId: UUID? = null

)