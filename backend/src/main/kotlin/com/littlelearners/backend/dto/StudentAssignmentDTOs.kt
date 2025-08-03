package com.littlelearners.backend.dto

import java.util.UUID

// --- StudentAssignment DTOs ---

data class StudentAssignmentRequest(
    val studentId: UUID,
    val assignmentId: UUID,
    val completionStatus: String = "PENDING", // Default status for new assignments
    val grade: Int? = null // Null by default
)

data class StudentAssignmentResponse(
    val id: UUID,
    val studentId: UUID,
    val studentFullName: String, // For easy display
    val assignmentId: UUID,
    val assignmentTitle: String, // For easy display
    val completionStatus: String,
    val grade: Int?
)