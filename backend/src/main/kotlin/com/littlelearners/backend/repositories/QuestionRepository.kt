package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.Question
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface QuestionRepository : JpaRepository<Question, UUID> {

    fun findByAssignment_Id(assignmentId: UUID): List<Question>
}