package com.littlelearners.backend.models

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "student_answers")
data class StudentAnswer(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    var student: Student,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    var question: Question,


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    var assignment: Assignment,



    @Column(name = "chosen_answer", nullable = false)
    var chosenAnswer: String,

    @Column(name = "is_correct", nullable = false)
    var isCorrect: Boolean


)
