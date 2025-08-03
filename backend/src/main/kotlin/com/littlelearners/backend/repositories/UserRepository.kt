package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByUsername(username: String): User?
    fun findByFirebaseUid(firebaseUid: String): User? // Add this line
}