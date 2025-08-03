package com.littlelearners.backend.dto

import java.util.UUID

// --- Student DTOs ---

data class StudentRequest(
    val fullName: String,
    val regNum: String,
    val grade: Int,
    val gender: String,
    val isActive: Boolean = true, // Default to true for new students
    val parentName: String?,
    val performanceScore: Int?,
    val teacherId: UUID // To link student to a teacher
)

data class StudentResponse(
    val id: UUID,
    val fullName: String,
    val regNum: String,
    val grade: Int,
    val gender: String,
    val isActive: Boolean,
    val parentName: String?,
    val performanceScore: Int?,
    val teacherId: UUID,
    val teacherUsername: String // Include teacher's username for display
)