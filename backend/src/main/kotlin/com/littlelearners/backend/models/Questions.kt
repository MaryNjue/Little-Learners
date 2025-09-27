package com.littlelearners.backend.models

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.Id
import java.util.UUID

@Entity
@Table(name = "questions")
data class Question(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    @JsonIgnore
    var assignment: Assignment,

    @Column(name = "question_text", nullable = false)
    var questionText: String,

    @Column(name = "options", nullable = false, columnDefinition = "TEXT")
    var options: String,

    @Column(name = "correct_answer", nullable = false)
    var correctAnswer: String
)
