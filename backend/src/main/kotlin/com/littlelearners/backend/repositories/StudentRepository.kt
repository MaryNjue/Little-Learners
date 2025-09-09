package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.Student
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface StudentRepository : JpaRepository<Student, UUID> {
    // Find all students associated with a specific teacher (using teacher's ID)
    fun findByTeacherId(teacherId: UUID): List<Student>
    fun findByUserId(userId: UUID): Student?

    fun findByGrade(grade: Int): List<Student>
}
