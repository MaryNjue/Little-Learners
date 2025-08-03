package com.littlelearners.backend.models

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "students")
data class Student(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "full_name", nullable = false)
    var fullName: String,

    @Column(name = "registration_number", unique = true, nullable = false)
    var regNum: String, // Registration Number

    @Column(name = "grade")
    var grade: Int,

    @Column(name = "gender")
    var gender: String, // You might consider an Enum for Gender as well

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true, // Default to true

    @Column(name = "parent_name")
    var parentName: String?, // Nullable as per schema

    @Column(name = "performance_score")
    var performanceScore: Int?, // Nullable as per schema

    // Many-to-One relationship with User (teacher)
    @ManyToOne(fetch = FetchType.LAZY) // LAZY fetch to avoid loading teacher data unnecessarily
    @JoinColumn(name = "teacher_id", nullable = false) // Specifies the foreign key column
    var teacher: User
)