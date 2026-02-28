package com.brainreptrack.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 3, max = 64, message = "El usuario debe tener entre 3 y 64 caracteres")
    private String username;

    @Email(message = "Formato de email inválido")
    private String email;

    private String displayName;

    @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres")
    private String newPassword;

    private String currentPassword;
}
