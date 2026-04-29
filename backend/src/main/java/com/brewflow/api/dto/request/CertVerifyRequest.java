package com.brewflow.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CertVerifyRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String certNumber;
}

