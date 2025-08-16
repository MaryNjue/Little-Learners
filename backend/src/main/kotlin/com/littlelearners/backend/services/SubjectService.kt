package com.littlelearners.backend.service

import com.littlelearners.backend.model.Subject
import com.littlelearners.backend.repository.SubjectRepository
import org.springframework.stereotype.Service
import java.util.NoSuchElementException

@Service
class SubjectService(
    private val subjectRepository: SubjectRepository
) {
    fun createSubject(name: String, teacherUid: String, description: String, gradeLevel: Int): Subject {
        require(name.isNotBlank()) { "Subject name cannot be blank." }
        require(description.isNotBlank()) { "Description cannot be blank." }

        val newSubject = Subject(
            name = name,
            teacherUid = teacherUid,
            description = description,
            gradeLevel = gradeLevel
        )
        return subjectRepository.save(newSubject)
    }

    // Assign a subject to an entire grade (only one subject per grade)
    fun assignSubjectToGrade(name: String, description: String, gradeLevel: Int, teacherUid: String): Subject {
        require(name.isNotBlank()) { "Subject name cannot be blank." }
        require(description.isNotBlank()) { "Description cannot be blank." }

        val newSubject = Subject(
            name = name,
            teacherUid = teacherUid,
            description = description,
            gradeLevel = gradeLevel
        )
        return subjectRepository.save(newSubject)
    }

    fun getSubjectsByGrade(gradeLevel: Int): List<Subject> {
        return subjectRepository.findByGradeLevel(gradeLevel)
    }

    fun getSubjectsByTeacherUid(teacherUid: String): List<Subject> {
        return subjectRepository.findByTeacherUid(teacherUid)
    }

    fun updateSubject(id: Long, newName: String, teacherUid: String): Subject {
        require(newName.isNotBlank()) { "Subject name cannot be blank." }

        val subject = subjectRepository.findById(id).orElseThrow {
            NoSuchElementException("Subject with id $id not found.")
        }

        if (subject.teacherUid != teacherUid) {
            throw SecurityException("You do not have permission to update this subject.")
        }

        subject.name = newName
        return subjectRepository.save(subject)
    }

    fun deleteSubject(id: Long, teacherUid: String) {
        val subject = subjectRepository.findById(id).orElseThrow {
            NoSuchElementException("Subject with id $id not found.")
        }

        if (subject.teacherUid != teacherUid) {
            throw SecurityException("You do not have permission to delete this subject.")
        }

        subjectRepository.delete(subject)
    }
}
