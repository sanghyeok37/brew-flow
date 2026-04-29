package com.brewflow.api.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyStat {
    private Long statId;
    private Long storeId;
    private LocalDate baseWeek;
    private Integer totalPoCount;
    private Integer totalPoAmount;
    private LocalDateTime createdAt;
}
