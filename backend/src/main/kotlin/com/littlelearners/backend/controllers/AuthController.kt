package com.littlelearners.backend.controllers

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.littlelearners.backend.dto.AuthResponse
import com.littlelearners.backend.dto.FirebaseTokenRequest
import com.littlelearners.backend.dto.LoginResponse
import com.littlelearners.backend.dto.UserLoginRequest
import com.littlelearners.backend.models.UserRole
import com.littlelearners.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val userService: UserService
)
{
    @PostMapping("/login")
    fun login(@RequestBody request: UserLoginRequest): ResponseEntity<Any> {
        return try {
            // ✅ Pass the entire DTO, not just username
            val response: LoginResponse = userService.authenticateUser(request)
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("message" to (e.message ?: "Invalid username or password")))
        }
    }



    @PostMapping("/firebase-auth")
    fun firebaseAuth(@RequestBody request: FirebaseTokenRequest): ResponseEntity<Any> {
        return try {
            val decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.idToken)

            val firebaseUid: String = decodedToken.uid
            val safeEmail: String = decodedToken.email ?: "${firebaseUid}@noemail.local"
            val safeUsername: String = decodedToken.name ?: decodedToken.email ?: firebaseUid

            // Placeholder hash for Firebase accounts that don’t use local passwords
            val placeholderPasswordHash = "FIREBASE_USER_NO_PASSWORD"
            val placeholderPassword = "firebase_placeholder_password"

            val user = userService.registerOrUpdateUser(
                username = safeUsername,
                email = safeEmail,
                firebaseUid = firebaseUid,
                password = placeholderPassword,
                role = UserRole.TEACHER
            )

            val response = AuthResponse(
                userId = user.id,
                username = user.username,
                email = user.email ?: safeEmail,
                role = user.role,
                fullName = decodedToken.name ?: safeUsername,
                message = "Firebase authentication successful"
            )

            ResponseEntity.ok(response)

        } catch (e: FirebaseAuthException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("message" to "Firebase token invalid: ${e.message}"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "Authentication failed: ${e.message}"))
        }
    }
}
