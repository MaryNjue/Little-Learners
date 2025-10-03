package com.littlelearners.backend.models

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp

@Entity
@Table(name = "assignments")
data class Assignment(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "title", nullable = false)
    var title: String,

    @Column(name = "description")
    var description: String?,

    @Column(name = "due_date")
    var dueDate: LocalDate?,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    var teacher: User,

    @Column(name = "assigned_student_ids")
    var assignedStudentIds: String?,

    @Column(name = "assigned_to", nullable = false)
    var assignedTo: String,

    @Column(name = "automated_config")
    var automatedConfig: String?,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "file_url")
    var fileUrl: String?,

    @Column(name = "max_marks")
    var maxMarks: Int?,

    @Column(name = "subject", nullable = false)
    var subject: String,

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    // ✅ Cascade delete all questions when assignment is deleted
    @OneToMany(mappedBy = "assignment", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var questions: MutableList<Question> = mutableListOf(),

    // ✅ Cascade delete student assignments
    @OneToMany(mappedBy = "assignment", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var studentAssignments: MutableList<StudentAssignment> = mutableListOf(),


)
