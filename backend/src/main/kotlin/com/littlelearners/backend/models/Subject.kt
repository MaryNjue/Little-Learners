package com.littlelearners.backend.model

import jakarta.persistence.*

@Entity
@Table(name = "subjects")
data class Subject(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var teacherUid: String,

    @Column(nullable = false)
    var description: String,

    @Column(nullable = false)
    var gradeLevel: Int // Assigned per grade, no studentId needed
)
