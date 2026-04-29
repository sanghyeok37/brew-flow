package com.brewflow.api.service.impl;
 
import com.brewflow.api.domain.Store;
import com.brewflow.api.domain.User;
import com.brewflow.api.exception.ForbiddenException;
import com.brewflow.api.mapper.AuthMapper;
import com.brewflow.api.service.StoreAccessService;
import com.brewflow.api.type.ErrorCode;
import com.brewflow.api.type.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class StoreAccessServiceImpl implements StoreAccessService {
 
    private final AuthMapper authMapper;
 
    @Override
    @Transactional(readOnly = true)
    public void assertUserHasStore(long userId, long storeId) {
        User user = authMapper.findUserById(userId)
                .orElseThrow(() -> new ForbiddenException("user not found"));
 
        // 1. SYSTEM 관리자는 모든 권한 통과
        if (UserRole.SYSTEM == user.getRole()) {
            return;
        }
 
        // 2. HQ(본사)는 브랜드 일치 여부 확인
        if (UserRole.HQ == user.getRole()) {
            String userBrand = authMapper.findMainStoreByUserId(userId)
                    .map(Store::getBrandCode)
                    .orElse(null);
            
            String storeBrand = authMapper.findStoreById(storeId)
                    .map(Store::getBrandCode)
                    .orElse(null);
            
            if (userBrand != null && userBrand.equals(storeBrand)) {
                return;
            }
        }
 
        // 3. 일반 점주는 매핑 데이터 확인 (본사 권한 없는 경우나 일반 점주인 경우)
        List<Long> storeIds = authMapper.findStoreIdsByUserId(userId);
        if (storeIds.stream().noneMatch(id -> id.equals(storeId))) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN.getMessage());
        }
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<Long> getUserStoreIds(long userId) {
        return authMapper.findStoreIdsByUserId(userId);
    }
}
