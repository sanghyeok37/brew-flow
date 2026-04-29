package com.brewflow.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CertSendRequest {
    @Email
    @NotBlank
    private String email;

    /**
     * "SIGNUP" | "PASSWORD_RESET"
     */
    @NotBlank
    private String purpose;
}

