package com.littlelearners.backend.dto

import java.time.LocalDate
import java.util.UUID

// --- Assignment DTOs ---

data class AssignmentRequest(
    val title: String,
    val description: String?,
    val dueDate: LocalDate?,
    val teacherId: UUID // To link assignment to a teacher
)

data class AssignmentResponse(
    val id: UUID,
    val title: String,
    val description: String?,
    val dueDate: LocalDate?,
    val teacherId: UUID,
    val teacherUsername: String // Include teacher's username for display
)