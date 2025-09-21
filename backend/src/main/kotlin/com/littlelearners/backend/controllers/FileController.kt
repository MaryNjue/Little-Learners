package com.littlelearners.backend.controllers

import com.littlelearners.backend.services.FileUploadService
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = ["http://localhost:3000"]) // allow frontend
class FileController(
    private val fileUploadService: FileUploadService
) {

    @PostMapping("/upload")
    fun uploadFile(@RequestParam("file") file: MultipartFile): Map<String, String> {
        val url = fileUploadService.uploadFile(file)
        return mapOf("url" to url)
    }
}
