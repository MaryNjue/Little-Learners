package com.littlelearners.backend.dto

import java.util.UUID

data class QuestionRequest(
    val assignmentId: UUID,
    val questionText: String,
    val options: List<String>,
    val correctAnswer: String
)

data class QuestionResponse(
    val id: UUID,
    val assignmentId: UUID,
    val questionText: String,
    val options: List<String>,
    val correctAnswer: String
)
