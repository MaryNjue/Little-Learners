package com.littlelearners.backend.models

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "student_assignments")
data class StudentAssignment(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    // Many-to-One relationship with Student
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    var student: Student,

    // Many-to-One relationship with Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    var assignment: Assignment,

    @Column(name = "completion_status", nullable = false)
    var completionStatus: String, // e.g., "PENDING", "COMPLETED", "GRADED"

    @Column(name = "grade")
    var grade: Int? // Nullable, as it might not be graded yet
)