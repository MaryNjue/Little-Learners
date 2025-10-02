package com.littlelearners.backend.dto

import java.util.UUID


data class StudentRequest(
    val fullName: String,
    val regNum: String,
    val grade: String,
    val gender: String,
    val isActive: Boolean,
    val parentName: String?,
    val performanceScore: Int?,
    val teacherFirebaseUid: String,
    val email: String,
    val password: String
)


data class StudentResponse(
    val id: UUID,
    val fullName: String,
    val regNum: String,
    val grade: String,
    val gender: String,
    val isActive: Boolean,
    val parentName: String?,
    val performanceScore: Int?,
    val email: String,
    val teacherId: UUID,
    val teacherUsername: String
)


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
