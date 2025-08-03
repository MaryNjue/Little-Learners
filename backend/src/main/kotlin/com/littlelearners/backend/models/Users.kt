package com.littlelearners.backend.models

import jakarta.persistence.*
import java.util.UUID

@Entity // Marks this class as a JPA entity
@Table(name = "users") // Specifies the table name in the database
data class User(
    @Id // Marks this field as the primary key
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(), // Initialize with a random UUID

    @Column(name = "username", unique = true, nullable = false)
    var username: String,

    @Column(name = "email", unique = true, nullable = false) // Add email field here
    var email: String, // Ensure you also have an email field if your users table has it and you use it for login

    @Column(name = "firebase_uid", unique = true, nullable = true) // Add this field!
    var firebaseUid: String? = null, // Make it nullable as it might be set after initial creation

    @Enumerated(EnumType.STRING) // Stores the enum name as a string in the DB
    @Column(name = "role", nullable = false)
    var role: UserRole // Use the UserRole enum defined below
)

// Define an Enum for user roles
enum class UserRole {
    TEACHER,
    STUDENT
}