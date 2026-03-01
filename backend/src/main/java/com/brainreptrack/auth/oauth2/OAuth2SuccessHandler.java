package com.brainreptrack.auth.oauth2;

import com.brainreptrack.auth.domain.User;
import com.brainreptrack.auth.repository.UserRepository;
import com.brainreptrack.auth.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * Ejecutado por Spring Security tras autenticación OAuth2 exitosa.
 *
 * Soporta el proveedor GitHub.
 * GitHub expone: id (Integer), login, name (puede ser null), email (puede ser null si es privado)
 *
 * Flujo:
 *  1. Detecta el proveedor (registrationId).
 *  2. Extrae subject, email y displayName según el proveedor.
 *  3. Find-or-create el usuario en BD.
 *  4. Genera nuestro JWT y redirige al frontend con el token en el fragmento (#).
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String registrationId = oauthToken.getAuthorizedClientRegistrationId(); // "github" | "google"
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        ProviderAttributes attrs = extractAttributes(registrationId, oAuth2User);

        if (attrs == null) {
            response.sendRedirect(frontendUrl + "/login?error=oauth2_missing_data");
            return;
        }

        // find-or-create: busca por provider+subject → por email → crea nuevo
        User user = userRepository
                .findByOauth2ProviderAndOauth2Subject(registrationId, attrs.subject())
                .orElseGet(() -> {
                    if (attrs.email() != null) {
                        return userRepository.findByEmail(attrs.email())
                                .map(existing -> {
                                    existing.setOauth2Provider(registrationId);
                                    existing.setOauth2Subject(attrs.subject());
                                    return userRepository.save(existing);
                                })
                                .orElseGet(() -> createOAuth2User(attrs, registrationId));
                    }
                    return createOAuth2User(attrs, registrationId);
                });

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Genera nuestro JWT — mismo método que AuthService.login()
        String jwt = jwtService.generateToken(user.getId(), user.getUsername());

        // Token en el fragmento (#) para que no aparezca en logs del servidor
        String fragment = "token=" + encode(jwt)
                + "&userId=" + encode(user.getId().toString())
                + "&username=" + encode(user.getUsername())
                + "&email=" + encode(user.getEmail() != null ? user.getEmail() : "")
                + "&displayName=" + encode(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());

        String redirectUrl = UriComponentsBuilder
                .fromHttpUrl(frontendUrl + "/oauth2/callback")
                .fragment(fragment)
                .build(true)
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    // ── Extracción de atributos por proveedor ─────────────────────────────────

    private ProviderAttributes extractAttributes(String provider, OAuth2User user) {
        return switch (provider) {
            case "github" -> extractGithub(user);
            default -> null;
        };
    }

    /** GitHub devuelve: id (Integer), login (username), name (puede ser null), email (puede ser null) */
    private ProviderAttributes extractGithub(OAuth2User user) {
        Object idObj = user.getAttribute("id");
        if (idObj == null) return null;

        String subject = idObj.toString();
        String email   = user.getAttribute("email");   // null si el email es privado en GitHub
        String login   = user.getAttribute("login");   // username de GitHub
        String name    = user.getAttribute("name");    // nombre real (puede ser null)

        // Si el email es privado, usamos la dirección noreply de GitHub (no conflictiva)
        String resolvedEmail = (email != null && !email.isBlank())
                ? email
                : login + "@users.noreply.github.com";

        return new ProviderAttributes(subject, resolvedEmail, name != null ? name : login);
    }

    // ── Creación de usuario nuevo ─────────────────────────────────────────────

    private User createOAuth2User(ProviderAttributes attrs, String provider) {
        String baseUsername = attrs.email().split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        String username     = ensureUniqueUsername(baseUsername);

        User newUser = User.builder()
                .email(attrs.email())
                .username(username)
                .displayName(attrs.displayName() != null ? attrs.displayName() : username)
                .passwordHash(null)           // sin contraseña local
                .oauth2Provider(provider)
                .oauth2Subject(attrs.subject())
                .build();

        return userRepository.save(newUser);
    }

    private String ensureUniqueUsername(String base) {
        String candidate = base;
        int i = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + i++;
        }
        return candidate;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    // ── Record interno para transportar atributos del proveedor ──────────────
    private record ProviderAttributes(String subject, String email, String displayName) {}
}
