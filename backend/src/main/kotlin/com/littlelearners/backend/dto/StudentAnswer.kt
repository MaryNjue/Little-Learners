package com.littlelearners.backend.dto

import java.util.UUID

data class StudentAnswer(

    val studentId: UUID,
    val questionId: UUID,
    val chosenAnswer: String
)


data class StudentAnswerResponse(
    val id: UUID,
    val chosenAnswer: String,
    val isCorrect: Boolean,
    val questionId: UUID,
    val studentId: UUID,
    val studentName: String
)