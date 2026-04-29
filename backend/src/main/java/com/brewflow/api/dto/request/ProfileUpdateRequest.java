package com.brewflow.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String nickname;
    
    @NotBlank
    private String contact;
}
