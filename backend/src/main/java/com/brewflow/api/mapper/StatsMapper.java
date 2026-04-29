package com.brewflow.api.mapper;

import com.brewflow.api.domain.PurchaseOrder;
import com.brewflow.api.domain.WeeklyStat;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface StatsMapper {
    List<PurchaseOrder> findMonthlyOrders(@Param("storeId") long storeId, @Param("year") int year, @Param("month") int month);

    List<WeeklyStat> findWeeklyStats(
            @Param("storeId") long storeId,
            @Param("limit") int limit,
            @Param("offset") int offset,
            @Param("orderBy") String orderBy
    );

    long countWeeklyStats(@Param("storeId") long storeId);

    List<Long> findStoreIdsWithOrders();

    List<PurchaseOrder> findOrdersInRange(@Param("storeId") long storeId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    void upsertWeeklyStat(@Param("storeId") long storeId, @Param("baseWeek") LocalDate baseWeek, @Param("totalPoCount") int totalPoCount, @Param("totalPoAmount") int totalPoAmount);
}

