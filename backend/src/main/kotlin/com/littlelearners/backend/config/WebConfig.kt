package com.littlelearners.backend.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**") // Apply CORS to all endpoints in your API
            .allowedOrigins("http://localhost:3000") // Allow requests from your React app's origin
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow common HTTP methods
            .allowedHeaders("*") // Allow all headers
            .allowCredentials(true) // Allow credentials (like cookies, authorization headers)
            .maxAge(3600); // Max age of the CORS pre-flight request
    }
}