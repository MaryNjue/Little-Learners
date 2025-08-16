package com.littlelearners.backend.models

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "users")
data class User(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    var id: UUID = UUID.randomUUID(),

    @Column(name = "username", unique = true, nullable = false)
    var username: String,

    @Column(name = "email", unique = true, nullable = true)
    var email: String? = null, // Nullable for students without emails

    @Column(name = "registration_number", unique = true, nullable = true)
    var regNum: String? = null,

    @Column(name = "password_hash", nullable = false)
    var passwordHash: String, // Always required

    @Column(name = "firebase_uid", unique = true, nullable = true)
    var firebaseUid: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    var role: UserRole
)

enum class UserRole {
    TEACHER,
    STUDENT
}
