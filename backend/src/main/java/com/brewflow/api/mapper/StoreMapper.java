package com.brewflow.api.mapper;

import com.brewflow.api.domain.StoreView;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StoreMapper {
    List<StoreView> findStores(
            @Param("brandCode") String brandCode,
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    long countStores(@Param("brandCode") String brandCode, @Param("keyword") String keyword, @Param("status") String status);

    StoreView findStoreDetailById(@Param("storeId") long storeId);

    void insert(com.brewflow.api.domain.Store store);

    boolean existsByStoreCode(@Param("storeCode") String storeCode);
}
