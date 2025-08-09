package com.littlelearners.backend.dto

import com.littlelearners.backend.models.UserRole
import java.util.UUID

data class AuthResponse(
    val userId: UUID, // This is the database UUID of the user
    val username: String,
    val email: String,
    val role: UserRole,
    val message: String
)