package com.littlelearners.backend.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:3000",
                "http://localhost:8080",
                "https://little-learners-three.vercel.app"
            )
            .allowedOriginPatterns("https://*.ngrok-free.app")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .exposedHeaders("Authorization", "Content-Type")
            .allowCredentials(true)
            .maxAge(3600)
    }

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:uploads/")
    }
}
