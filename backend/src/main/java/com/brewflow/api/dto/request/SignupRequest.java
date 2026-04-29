package com.brewflow.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank(message = "아이디는 필수입니다.")
    @Pattern(regexp = "^[a-zA-Z][a-zA-Z0-9]{4,19}$", message = "아이디는 5~20자의 영문 및 숫자여야 하며, 영문으로 시작해야 합니다.")
    private String username;

    @NotBlank(message = "이름은 필수입니다.")
    @Pattern(regexp = "^[가-힣]{2,6}$", message = "이름은 2~6자의 한글이어야 합니다.")
    private String name;

    @NotBlank(message = "닉네임은 필수입니다.")
    @Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = "닉네임은 2~10자의 한글, 영문, 숫자여야 합니다.")
    private String nickname;

    @NotBlank(message = "연락처는 필수입니다.")
    @Pattern(regexp = "^010[0-9]{8}$", message = "연락처는 010으로 시작하는 11자리 숫자여야 합니다.")
    private String contact;

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    @NotBlank(message = "가맹점 코드는 필수입니다.")
    @Pattern(regexp = "^[A-Z0-9]{3}[0-9]{5}$", message = "가맹점 코드는 영문/숫자 3자리 + 숫자 5자리 형식이어야 합니다. (예: ABC12345)")
    private String storeCode;

    @NotBlank
    private String certNumber;
}

