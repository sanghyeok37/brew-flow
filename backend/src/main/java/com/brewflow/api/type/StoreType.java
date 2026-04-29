package com.brewflow.api.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StoreType {
    SYSTEM("시스템 관리용"),
    HQ("브랜드 본사"),
    STORE("일반 가맹점");

    private final String description;
}
