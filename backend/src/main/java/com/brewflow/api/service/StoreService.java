package com.brewflow.api.service;

import com.brewflow.api.domain.StoreView;
import com.brewflow.api.dto.response.MonthlyProductSummary;
import com.brewflow.api.dto.response.PageResponse;

import java.util.List;

public interface StoreService {
    PageResponse<StoreView> getStoresForManagement(long userId, String keyword, String status, int page, int size);
    StoreView getStoreDetail(long userId, long storeId);
    Long getMonthlyOrderAmount(long storeId, int year, int month);
    List<MonthlyProductSummary> getMonthlyProductSummaries(long storeId, int year, int month);

    void createStore(com.brewflow.api.dto.request.StoreCreateRequest request, long userId);
    
    boolean isStoreCodeDuplicate(String storeCode);
}
