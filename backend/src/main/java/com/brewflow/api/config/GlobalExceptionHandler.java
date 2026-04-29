package com.brewflow.api.config;

import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.exception.ForbiddenException;
import com.brewflow.api.exception.NotFoundException;
import com.brewflow.api.exception.UnauthorizedException;
import com.brewflow.api.type.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fields = new LinkedHashMap<>();
        StringBuilder detailMessage = new StringBuilder("Validation failed: ");
        
        for (FieldError fe : e.getBindingResult().getFieldErrors()) {
            fields.put(fe.getField(), fe.getDefaultMessage());
            detailMessage.append("[").append(fe.getField()).append(": ").append(fe.getDefaultMessage()).append("] ");
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message(detailMessage.toString().trim())
                        .data(fields)
                        .build());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException e) {
        return error(HttpStatus.NOT_FOUND, e.getMessage(), "C002", e);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException e) {
        return error(HttpStatus.UNAUTHORIZED, e.getMessage(), "C005", e);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException e) {
        return error(HttpStatus.FORBIDDEN, e.getMessage(), "C004", e);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e) {
        return error(e.getErrorCode().getStatus(), e.getMessage(), e.getErrorCode().getCode(), e);
    }

    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataAccessException(org.springframework.dao.DataAccessException e) {
        String msg = "데이터베이스 작업 중 오류가 발생했습니다. (락 대기 시간 초과 등)";
        if (e.getMessage().contains("Lock wait timeout exceeded")) {
            msg = "데이터베이스 서버가 응답을 기다리고 있습니다. DB 관리 도구(DBeaver 등)에서 커밋되지 않은 작업이 있는지 확인해 주세요.";
        }
        return error(HttpStatus.INTERNAL_SERVER_ERROR, msg, "D001", e);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception e) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "예상치 못한 서버 오류가 발생했습니다. 관리자에게 문의하세요.", "C003", e);
    }

    private <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message, String code, Exception e) {
        if (status.is5xxServerError()) {
            log.error("[{}] Unhandled error: {}", code, message, e);
        } else {
            log.warn("[{}] Request error: {}", code, message);
        }
        return ResponseEntity.status(status)
                .body(ApiResponse.<T>builder()
                        .status(status.value())
                        .message(message)
                        .code(code) // Assuming ApiResponse has a code field
                        .data(null)
                        .build());
    }
}

