package com.littlelearners.backend.repositories

import com.littlelearners.backend.models.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface UserRepository : JpaRepository<User, UUID> {
    fun findByFirebaseUid(firebaseUid: String): User?
    fun findByUsername(username: String): User?
}
