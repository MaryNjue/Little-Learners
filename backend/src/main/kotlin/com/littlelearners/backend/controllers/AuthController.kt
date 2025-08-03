package com.littlelearners.backend.controllers

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.littlelearners.backend.dto.AuthResponse // Use the new DTO
import com.littlelearners.backend.dto.FirebaseTokenRequest // Use the new DTO
import com.littlelearners.backend.models.UserRole
import com.littlelearners.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController // Marks this class as a REST Controller
@RequestMapping("/api/auth") // Base path for all endpoints in this controller
class AuthController(private val userService: UserService) {

    // NEW ENDPOINT: Handles Firebase ID Token verification and user management
    @PostMapping("/firebase-auth")
    fun firebaseAuth(@RequestBody request: FirebaseTokenRequest): ResponseEntity<Any> {
        return try {
            val decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.idToken)
            val firebaseUid = decodedToken.uid
            val email = decodedToken.email // Email is usually available in the token
            val username = decodedToken.name ?: decodedToken.email // Use name from token, fallback to email

            // Find user in your database, or register/update them if they are new to your system
            val user = userService.registerOrUpdateUser(
                username = username,
                email = email,
                firebaseUid = firebaseUid,
                role = UserRole.STUDENT // Default role for *new* users.
                // For existing users, registerOrUpdateUser will use their existing role.
                // If you need teachers to register/login via Firebase,
                // their role must already be set in your DB, or set via custom claims
                // in Firebase if you want to assign it at login.
                // For now, new users default to STUDENT.
            )

            // Return success response with internal user details
            ResponseEntity.ok(
                AuthResponse(
                    userId = user.id,
                    username = user.username,
                    email = user.email,
                    role = user.role,
                    message = "Firebase authentication successful"
                )
            )

        } catch (e: FirebaseAuthException) {
            // Firebase token is invalid or expired
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("message" to "Firebase token invalid: ${e.message}"))
        } catch (e: Exception) {
            // Other server-side errors
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("message" to "Authentication failed: ${e.message}"))
        }
    }

    // --- REMOVE or COMMENT OUT these old endpoints ---
    // They are no longer compatible with Firebase authentication flow.
    // If you need a separate registration process for roles, it would be a different API.

    /*
    @PostMapping("/register")
    fun registerUser(@RequestBody request: UserRegistrationRequest): ResponseEntity<Any> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("message" to "This endpoint is deprecated. Use /api/auth/firebase-auth for user authentication."))
    }

    @PostMapping("/login")
    fun loginUser(@RequestBody request: UserLoginRequest): ResponseEntity<Any> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("message" to "This endpoint is deprecated. Use /api/auth/firebase-auth for user authentication."))
    }
    */
}