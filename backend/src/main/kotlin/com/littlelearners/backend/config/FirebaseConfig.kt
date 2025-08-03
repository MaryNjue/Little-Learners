package com.littlelearners.backend.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import java.io.IOException

@Configuration
class FirebaseConfig {

    @Bean
    fun firebaseApp(): FirebaseApp {
        return try {
            val serviceAccount = ClassPathResource("serviceAccountKey.json").inputStream

            val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                // .setDatabaseUrl("https://<YOUR_DATABASE_NAME>.firebaseio.com") // Only if you use Realtime Database
                .build()

            // Check if an app is already initialized to avoid re-initialization errors in dev mode
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options)
            } else {
                FirebaseApp.getInstance()
            }
        } catch (e: IOException) {
            // Log the error properly in a real application
            System.err.println("Error initializing Firebase: " + e.message)
            throw RuntimeException("Failed to initialize Firebase Admin SDK", e)
        }
    }
}