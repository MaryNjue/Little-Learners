package com.littlelearners.backend.models

import jakarta.persistence.*
import java.time.LocalDate // For DATE type
import java.util.UUID

@Entity
@Table(name = "assignments")
data class Assignment(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "title", nullable = false)
    var title: String,

    @Column(name = "description")
    var description: String?, // Nullable as per schema

    @Column(name = "due_date")
    var dueDate: LocalDate?, // Using LocalDate for SQL DATE type. Nullable.

    // Many-to-One relationship with User (teacher)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    var teacher: User
)