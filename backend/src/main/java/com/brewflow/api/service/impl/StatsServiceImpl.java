package com.brewflow.api.service.impl;
 
import com.brewflow.api.domain.User;
import com.brewflow.api.domain.WeeklyStat;
import com.brewflow.api.dto.response.DashboardStatsResponse;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.mapper.*;
import com.brewflow.api.service.StatsService;
import com.brewflow.api.service.StoreAccessService;
import com.brewflow.api.type.ErrorCode;
import com.brewflow.api.type.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {
 
    private final StoreAccessService storeAccessService;
    private final StatsMapper statsMapper;
    private final AuthMapper authMapper;
    private final StoreMapper storeMapper;
    private final ProductMapper productMapper;
    private final InventoryMapper inventoryMapper;
    private final PurchaseOrderMapper purchaseOrderMapper;
 
    @Override
    @Transactional(readOnly = true)
    public com.brewflow.api.dto.response.SettlementResponse getMonthlySettlementAmount(long userId, long storeId, int year, int month) {
        storeAccessService.assertUserHasStore(userId, storeId);
        
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        
        Long confirmed = purchaseOrderMapper.getMonthlyOrderAmountByStatuses(storeId, start, end, List.of("DELIVERED"));
        Long ordered = purchaseOrderMapper.getMonthlyOrderAmountByStatuses(storeId, start, end, List.of("ORDERED"));
        Long pending = purchaseOrderMapper.getMonthlyOrderAmountByStatuses(storeId, start, end, List.of("PENDING"));
        
        int confirmedVal = confirmed != null ? confirmed.intValue() : 0;
        int orderedVal = ordered != null ? ordered.intValue() : 0;
        int pendingVal = pending != null ? pending.intValue() : 0;
        
        return com.brewflow.api.dto.response.SettlementResponse.builder()
                .storeId(storeId)
                .year(year)
                .month(month)
                .amount(confirmedVal)
                .confirmedAmount(confirmedVal)
                .orderedAmount(orderedVal)
                .pendingAmount(pendingVal)
                .build();
    }
 
    @Override
    @Transactional(readOnly = true)
    public com.brewflow.api.dto.response.PageResponse<WeeklyStat> getWeeklyStats(long userId, long storeId, int page, int size, String orderBy) {
        storeAccessService.assertUserHasStore(userId, storeId);
        
        long total = statsMapper.countWeeklyStats(storeId);
        int offset = page * size;
        List<WeeklyStat> content = statsMapper.findWeeklyStats(storeId, size, offset, orderBy);
        
        return com.brewflow.api.dto.response.PageResponse.of(content, page, size, total);
    }
 
    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(long userId, Long storeId) {
        User user = authMapper.findUserById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        
        DashboardStatsResponse.DashboardStatsResponseBuilder builder = DashboardStatsResponse.builder();
        
        if (UserRole.SYSTEM == user.getRole()) {
            String brandCode = authMapper.findMainStoreByUserId(userId)
                    .map(com.brewflow.api.domain.Store::getBrandCode)
                    .orElse(null);
            builder.storeCount(storeMapper.countStores(null, null, null));
            builder.productCount(productMapper.countAvailableProducts(brandCode, true));
        } else if (UserRole.HQ == user.getRole()) {
            String brandCode = authMapper.findMainStoreByUserId(userId)
                    .map(com.brewflow.api.domain.Store::getBrandCode)
                    .orElse(null);
            builder.storeCount(storeMapper.countStores(brandCode, null, null));
            builder.productCount(productMapper.countAvailableProducts(brandCode, false));
        } else {
            // STORE user: 파라미터가 없으면 사용자의 메인 점포를 찾아서 집계합니다.
            Long effectiveStoreId = storeId;
            if (effectiveStoreId == null) {
                effectiveStoreId = authMapper.findMainStoreByUserId(userId)
                        .map(com.brewflow.api.domain.Store::getStoreId)
                        .orElse(null);
            }

            if (effectiveStoreId != null) {
                storeAccessService.assertUserHasStore(userId, effectiveStoreId);
                builder.lowStockCount(inventoryMapper.countLowStockByStoreId(effectiveStoreId));
                // 진행 중인 발주(장바구니 + 발주 완료) 건수를 집계합니다.
                builder.pendingOrderCount(purchaseOrderMapper.countOrdersByStatuses(effectiveStoreId, java.util.List.of("PENDING", "ORDERED")));
            }
        }
        
        return builder.build();
    }
 
    /**
     * 스케줄러 전용: 지난주(월~일)의 발주 통계를 확정 집계합니다.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void generateLastWeekStats() {
        LocalDate today = LocalDate.now();
        LocalDate thisWeekMon = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate lastWeekMon = thisWeekMon.minusWeeks(1);

        processStatsForRange(lastWeekMon, 
            LocalDateTime.of(lastWeekMon, LocalTime.MIDNIGHT), 
            LocalDateTime.of(thisWeekMon, LocalTime.MIDNIGHT));
    }

    /**
     * 시연/수동 트리거 전용: 이번 주 월요일부터 현재 시점까지의 실시간 통계를 집계합니다.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void generateLiveWeeklyStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        LocalDate thisWeekMon = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        processStatsForRange(thisWeekMon, 
            LocalDateTime.of(thisWeekMon, LocalTime.MIDNIGHT), 
            now);
    }

    private void processStatsForRange(LocalDate baseWeek, LocalDateTime from, LocalDateTime to) {
        for (Long storeId : statsMapper.findStoreIdsWithOrders()) {
            List<com.brewflow.api.domain.PurchaseOrder> orders = statsMapper.findOrdersInRange(storeId, from, to);
            int count = orders.size();
            int amount = orders.stream().mapToInt(com.brewflow.api.domain.PurchaseOrder::getTotalAmount).sum();
            statsMapper.upsertWeeklyStat(storeId, baseWeek, count, amount);
        }
    }
}
