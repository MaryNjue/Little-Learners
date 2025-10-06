package com.littlelearners.backend.dto

import com.littlelearners.backend.models.UserRole
import java.util.UUID

data class AuthResponse(
    val userId: UUID,
    val username: String,
    val fullName: String?,
    val email: String,
    val role: UserRole,
    val message: String,
)