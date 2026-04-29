package com.brewflow.api.service;

import com.brewflow.api.domain.WeeklyStat;

import java.util.List;

public interface StatsService {
    com.brewflow.api.dto.response.SettlementResponse getMonthlySettlementAmount(long userId, long storeId, int year, int month);

    com.brewflow.api.dto.response.PageResponse<WeeklyStat> getWeeklyStats(long userId, long storeId, int page, int size, String orderBy);

    com.brewflow.api.dto.response.DashboardStatsResponse getDashboardStats(long userId, Long storeId);

    void generateLastWeekStats();
    void generateLiveWeeklyStats();
}

