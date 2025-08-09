package com.littlelearners.backend.dto

import java.time.LocalDate
import java.util.UUID

data class AssignmentRequest(
    val title: String,
    val description: String?,
    val dueDate: LocalDate?,
    val firebaseUid: String,
    val subject: String,
    val maxMarks: Int?,
    val fileUrl: String?,
    val automatedConfig: String?,
    val assignedTo: String,
    val assignedStudentIds: List<UUID>?
)

data class AssignmentResponse(
    val id: UUID,
    val title: String,
    val description: String?,
    val dueDate: LocalDate?,
    val teacherId: UUID,
    val teacherUsername: String,
    val subject: String,
    val maxMarks: Int?,
    val fileUrl: String?,
    val assignedTo: String,
    val assignedStudentIds: List<UUID>?
)

