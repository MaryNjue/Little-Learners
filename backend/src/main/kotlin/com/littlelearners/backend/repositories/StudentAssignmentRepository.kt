package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.StudentAssignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StudentAssignmentRepository : JpaRepository<StudentAssignment, UUID> {


    fun findByStudent_Id(studentId: UUID): List<StudentAssignment>


    fun findFirstByStudent_IdAndAssignment_Id(studentId: UUID, assignmentId: UUID): StudentAssignment?
}
