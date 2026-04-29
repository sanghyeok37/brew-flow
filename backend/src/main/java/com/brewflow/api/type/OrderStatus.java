package com.brewflow.api.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderStatus {
    PENDING("승인 대기"),
    ORDERED("발주 완료"),
    DELIVERED("배송 완료"),
    CANCELED("발주 취소");

    private final String description;
}
