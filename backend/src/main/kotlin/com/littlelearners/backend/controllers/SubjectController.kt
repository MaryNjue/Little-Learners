package com.littlelearners.backend.controller

import com.littlelearners.backend.model.Subject
import com.littlelearners.backend.service.SubjectService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.NoSuchElementException

@RestController
@RequestMapping("/api/subjects")
class SubjectController(private val subjectService: SubjectService) {

    private fun getAuthenticatedTeacherUid(): String {
        return "example-teacher-uid" // TODO: Replace with real authentication
    }

    @PostMapping
    fun createSubject(@RequestBody subject: Subject): ResponseEntity<Subject> {
        val teacherUid = getAuthenticatedTeacherUid()
        val newSubject = subjectService.createSubject(subject.name, teacherUid, subject.description, subject.gradeLevel)
        return ResponseEntity(newSubject, HttpStatus.CREATED)
    }

    @PostMapping("/assignToGrade")
    fun assignSubjectToGrade(@RequestBody request: AssignSubjectToGradeRequest): ResponseEntity<Subject> {
        val teacherUid = getAuthenticatedTeacherUid()
        val assignedSubject = subjectService.assignSubjectToGrade(
            name = request.name,
            description = request.description,
            gradeLevel = request.gradeLevel,
            teacherUid = teacherUid
        )
        return ResponseEntity(assignedSubject, HttpStatus.CREATED)
    }

    @GetMapping("/teacher/{teacherUid}")
    fun getSubjectsByTeacher(@PathVariable teacherUid: String): ResponseEntity<List<Subject>> {
        val authenticatedUid = getAuthenticatedTeacherUid()
        if (authenticatedUid != teacherUid) {
            return ResponseEntity(HttpStatus.FORBIDDEN)
        }
        val subjects = subjectService.getSubjectsByTeacherUid(teacherUid)
        return ResponseEntity(subjects, HttpStatus.OK)
    }

    @GetMapping("/grade/{gradeLevel}")
    fun getSubjectsByGrade(@PathVariable gradeLevel: Int): ResponseEntity<List<Subject>> {
        val subjects = subjectService.getSubjectsByGrade(gradeLevel)
        return ResponseEntity(subjects, HttpStatus.OK)
    }

    @PutMapping("/{id}")
    fun updateSubject(@PathVariable id: Long, @RequestBody subject: Subject): ResponseEntity<Subject> {
        return try {
            val teacherUid = getAuthenticatedTeacherUid()
            val updatedSubject = subjectService.updateSubject(id, subject.name, teacherUid)
            ResponseEntity(updatedSubject, HttpStatus.OK)
        } catch (e: SecurityException) {
            ResponseEntity(HttpStatus.FORBIDDEN)
        } catch (e: NoSuchElementException) {
            ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }

    @DeleteMapping("/{id}")
    fun deleteSubject(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            val teacherUid = getAuthenticatedTeacherUid()
            subjectService.deleteSubject(id, teacherUid)
            ResponseEntity(HttpStatus.NO_CONTENT)
        } catch (e: SecurityException) {
            ResponseEntity(HttpStatus.FORBIDDEN)
        } catch (e: NoSuchElementException) {
            ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }
}

data class AssignSubjectToGradeRequest(
    val name: String,
    val description: String,
    val gradeLevel: Int
)
