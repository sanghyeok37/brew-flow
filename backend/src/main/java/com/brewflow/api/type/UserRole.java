package com.brewflow.api.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    SYSTEM("ROLE_SYSTEM", "시스템 관리자"),
    HQ("ROLE_HQ", "브랜드 본사"),
    STORE("ROLE_STORE", "가맹점 점주");

    private final String authority;
    private final String description;
}
