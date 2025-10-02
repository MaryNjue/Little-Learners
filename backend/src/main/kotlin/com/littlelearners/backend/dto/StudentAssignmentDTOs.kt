package com.littlelearners.backend.dto

import java.util.UUID



data class StudentAssignmentRequest(
    val studentId: UUID,
    val assignmentId: UUID,
    val completionStatus: String = "PENDING",
    val grade: Int? = null
)

data class StudentAssignmentResponse(
    val id: UUID,
    val studentId: UUID,
    val studentFullName: String,
    val assignmentId: UUID,
    val assignmentTitle: String,
    val completionStatus: String,
    val grade: Int?
)