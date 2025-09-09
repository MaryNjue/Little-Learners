package com.littlelearners.backend.dto

import java.util.UUID

// Request DTO used when teacher creates a student
data class StudentRequest(
    val fullName: String,
    val regNum: String,
    val grade: String,
    val gender: String,
    val isActive: Boolean,
    val parentName: String?,
    val performanceScore: Int?,
    val teacherFirebaseUid: String,
    val email: String,       // Teacher-provided email
    val password: String     // Teacher-provided password
)

// Response DTO sent back to client
data class StudentResponse(
    val id: UUID,
    val fullName: String,
    val regNum: String,
    val grade: String,
    val gender: String,
    val isActive: Boolean,
    val parentName: String?,
    val performanceScore: Int?,
    val email: String,       // Include email for login purposes
    val teacherId: UUID,
    val teacherUsername: String
)

// Optional DTO if you want a simplified account creation without email
data class StudentAccountRequest(
    val fullName: String,
    val regNum: String,
    val password: String,
    val grade: String,
    val gender: String,
    val isActive: Boolean = true,
    val parentName: String?,
    val performanceScore: Int?,
    val teacherFirebaseUid: String
)
