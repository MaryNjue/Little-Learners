package com.littlelearners.backend.dto
import java.util.UUID
import com.littlelearners.backend.dto.UserResponse
import com.littlelearners.backend.dto.UserRequest


data class UserRequest(
    val username: String,
    val email: String,
    val password: String,
    val role: String
)
