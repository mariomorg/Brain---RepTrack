package com.brainreptrack.config;

import com.brainreptrack.auth.oauth2.OAuth2SuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration.
 *
 * Estrategia:
 * - Toda la autorización la gestiona JwtAuthFilter (servlet Filter @Order(1)).
 * Spring Security deja pasar todas las rutas sin restricciones adicionales.
 * - Spring Security solo gestiona el flujo OAuth2 (redirect a Google, callback,
 * intercambio de código). Tras auth exitosa, OAuth2SuccessHandler genera
 * nuestro JWT y redirige al frontend.
 * - Sesiones stateless: no se crea HttpSession de servidor.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    public SecurityConfig(OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF deshabilitado: API stateless con JWT
                .csrf(csrf -> csrf.disable())

                // Desactivar X-Frame-Options para permitir embeds en el propio frontend
                .headers(headers -> headers.frameOptions(fo -> fo.disable()))

                // Toda la autorización la maneja JwtAuthFilter; Spring Security permite todo
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())

                // IF_REQUIRED: crea sesión solo cuando OAuth2 la necesita para el parámetro
                // `state` (CSRF durante el intercambio code→token). Las llamadas normales
                // a /api/** con JWT no crean sesión.
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                // OAuth2 Login — Spring Security maneja automáticamente:
                // GET /api/auth/oauth2/github → redirect a GitHub
                // GET /api/auth/oauth2/callback/github → intercambio code→token
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(ae -> ae
                                .baseUri("/api/auth/oauth2"))
                        .redirectionEndpoint(re -> re
                                .baseUri("/api/auth/oauth2/callback/*"))
                        .successHandler(oAuth2SuccessHandler));

        return http.build();
    }
}
