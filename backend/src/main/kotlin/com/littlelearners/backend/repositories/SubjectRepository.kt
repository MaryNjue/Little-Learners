package com.littlelearners.backend.repository

import com.littlelearners.backend.model.Subject
import org.springframework.data.jpa.repository.JpaRepository

interface SubjectRepository : JpaRepository<Subject, Long> {
    fun findByTeacherUid(teacherUid: String): List<Subject>
    fun findByGradeLevel(gradeLevel: Int): List<Subject>
}
