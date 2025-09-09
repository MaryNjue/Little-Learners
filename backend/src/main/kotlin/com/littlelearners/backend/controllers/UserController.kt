package com.littlelearners.backend.controllers

import com.littlelearners.backend.dto.UserRequest
import com.littlelearners.backend.models.UserRole
import com.littlelearners.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {

    @PostMapping
    fun createUser(@RequestBody request: UserRequest): ResponseEntity<Any> {
        return try {
            val role = try {
                UserRole.valueOf(request.role.uppercase())
            } catch (ex: Exception) {
                return ResponseEntity.badRequest().body("Invalid role: ${request.role}")
            }

            val createdUser = userService.registerOrUpdateUser(
                username = request.username,
                email = request.email,
                firebaseUid = null, // will be set after Firebase auth if needed
                role = role,
                password = request.password 
            )

            ResponseEntity.status(HttpStatus.CREATED).body(createdUser)
        } catch (ex: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating user: ${ex.message}")
        }
    }

    @GetMapping("/{id}")
    fun getUser(@PathVariable id: UUID): ResponseEntity<Any> {
        val user = userService.findById(id)
        return if (user != null) {
            ResponseEntity.ok(user)
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found")
        }
    }
}
