package com.littlelearners.backend.services

import com.cloudinary.Cloudinary
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
class FileUploadService(private val cloudinary: Cloudinary) {

    fun uploadFile(file: MultipartFile): String {
        val uploadResult = cloudinary.uploader().upload(
            file.bytes,
            mapOf(
                "folder" to "assignments",
                "resource_type" to "auto",
                "access_mode" to "public"
            )
        )
        return uploadResult["secure_url"].toString()
    }
}
