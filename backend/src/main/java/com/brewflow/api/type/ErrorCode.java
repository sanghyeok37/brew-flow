package com.brewflow.api.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "C001", "Invalid input value"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C002", "Resource not found"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "Internal server error"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "C004", "Access denied"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "C005", "Authentication failed"),

    // Auth
    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "A001", "Email already exists"),
    USERNAME_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "A002", "Username already exists"),
    CERT_REQUIRED(HttpStatus.BAD_REQUEST, "A003", "Email certification required"),
    CERT_MISMATCH(HttpStatus.BAD_REQUEST, "A004", "Certification code does not match"),
    CERT_EXPIRED(HttpStatus.BAD_REQUEST, "A005", "Certification code expired"),
    INVALID_STORE_CODE(HttpStatus.BAD_REQUEST, "A006", "Invalid store code"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "A007", "Invalid username or password"),
    ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "A008", "Account is inactive or deleted"),

    // Business
    INSUFFICIENT_STOCK(HttpStatus.BAD_REQUEST, "B001", "재고가 부족합니다."),
    ORDER_NOT_MODIFIABLE(HttpStatus.BAD_REQUEST, "B002", "Only pending orders can be modified"),
    ORDER_NOT_CANCELABLE(HttpStatus.BAD_REQUEST, "B003", "Only pending orders can be canceled"),
    INVALID_STATE_TRANSITION(HttpStatus.BAD_REQUEST, "B004", "Invalid status transition");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
