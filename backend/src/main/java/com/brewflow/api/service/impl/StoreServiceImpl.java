package com.brewflow.api.service.impl;
 
import com.brewflow.api.domain.StoreView;
import com.brewflow.api.domain.User;
import com.brewflow.api.type.UserRole;
import com.brewflow.api.dto.response.MonthlyProductSummary;
import com.brewflow.api.dto.response.PageResponse;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.mapper.AuthMapper;
import com.brewflow.api.mapper.PurchaseOrderMapper;
import com.brewflow.api.mapper.StoreMapper;
import com.brewflow.api.service.StoreAccessService;
import com.brewflow.api.service.StoreService;
import com.brewflow.api.type.ErrorCode;
import com.brewflow.api.type.StoreStatus;
import com.brewflow.api.type.StoreType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.time.LocalDateTime;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {
 
    private final StoreMapper storeMapper;
    private final AuthMapper authMapper;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final StoreAccessService storeAccessService;
 
    @Override
    @Transactional(readOnly = true)
    public PageResponse<StoreView> getStoresForManagement(long userId, String keyword, String status, int page, int size) {
        User user = authMapper.findUserById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
 
        int offset = page * size;
        String filterBrandCode = null;

        if (user.getRole() == UserRole.HQ) {
            filterBrandCode = authMapper.findMainStoreByUserId(userId)
                    .map(s -> s.getBrandCode())
                    .orElse(null);
        }
 
        List<StoreView> content = storeMapper.findStores(filterBrandCode, keyword, status, size, offset);
        long total = storeMapper.countStores(filterBrandCode, keyword, status);
 
        return PageResponse.of(content, page, size, total);
    }
 
    @Override
    @Transactional(readOnly = true)
    public StoreView getStoreDetail(long userId, long storeId) {
        storeAccessService.assertUserHasStore(userId, storeId);
        return storeMapper.findStoreDetailById(storeId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getMonthlyOrderAmount(long storeId, int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        return purchaseOrderMapper.getMonthlyOrderAmount(storeId, start, end);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyProductSummary> getMonthlyProductSummaries(long storeId, int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        return purchaseOrderMapper.getMonthlyProductSummaries(storeId, start, end);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createStore(com.brewflow.api.dto.request.StoreCreateRequest request, long userId) {
        User user = authMapper.findUserById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        String brandCode = request.getBrandCode();

        // HQ 권한일 경우 자신의 브랜드 코드로 강제 고정
        if (user.getRole() == UserRole.HQ) {
            brandCode = authMapper.findMainStoreByUserId(userId)
                    .map(s -> s.getBrandCode())
                    .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));
        }

        // 점포 코드 조합 (브랜드 코드 + 입력한 코드)
        String suffix = request.getStoreCode();
        String storeCode = brandCode + suffix;

        // 코드 뒷자리가 00000이면 본사(HQ), 아니면 일반 점포(STORE)로 설정
        com.brewflow.api.type.StoreType detectedType = "00000".equals(suffix) 
                ? com.brewflow.api.type.StoreType.HQ 
                : com.brewflow.api.type.StoreType.STORE;

        com.brewflow.api.domain.Store store = com.brewflow.api.domain.Store.builder()
                .name(request.getName())
                .brandCode(brandCode)
                .storeCode(storeCode)
                .type(detectedType)
                .status(com.brewflow.api.type.StoreStatus.OPEN)
                .build();

        storeMapper.insert(store);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStoreCodeDuplicate(String storeCode) {
        return storeMapper.existsByStoreCode(storeCode);
    }
}
