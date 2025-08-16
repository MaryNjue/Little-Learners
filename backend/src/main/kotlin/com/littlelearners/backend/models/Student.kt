package com.littlelearners.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
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
    var regNum: String,

    @Column(name = "grade", nullable = false)
    var grade: Int,

    @Column(name = "gender", nullable = false)
    var gender: String,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "parent_name")
    var parentName: String? = null,

    @Column(name = "performance_score")
    var performanceScore: Int? = null,

    // Student’s own user account for login (admission number + password)
    @OneToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    var user: User,
    // Teacher who manages this student
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    var teacher: User
)
