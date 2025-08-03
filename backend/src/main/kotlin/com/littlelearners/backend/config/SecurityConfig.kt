package com.littlelearners.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

@Configuration // Marks this class as a source of bean definitions
@EnableWebSecurity // Enables Spring Security's web security features
class SecurityConfig {

    // Defines a PasswordEncoder bean to be used for hashing passwords
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder() // Using BCrypt for strong hashing
    }

    // Basic SecurityFilterChain configuration
    // This configuration is for initial setup, allowing all requests for now
    // We will implement proper authentication/authorization later
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { csrf -> csrf.disable() } // Disable CSRF for stateless REST APIs
            .authorizeHttpRequests { auth ->
                auth.anyRequest().permitAll() // Permit all requests for now
            }
        return http.build()
    }
}