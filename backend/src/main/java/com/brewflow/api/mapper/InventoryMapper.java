package com.brewflow.api.mapper;

import com.brewflow.api.domain.StoreInventoryView;
import com.brewflow.api.domain.ThresholdTarget;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface InventoryMapper {

    List<StoreInventoryView> findInventoryByStoreId(
            @Param("storeId") long storeId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    long countInventoryByStoreId(@Param("storeId") long storeId);
 
    long countLowStockByStoreId(@Param("storeId") long storeId);

    Optional<StoreInventoryView> findInventoryRowForUpdate(@Param("storeId") long storeId, @Param("productId") long productId);

    List<ThresholdTarget> findThresholdTargets();

    void updateInventorySettings(@Param("storeId") long storeId, @Param("productId") long productId, @Param("safetyStockQty") int safetyStockQty, @Param("autoOrderQty") int autoOrderQty);

    void updateCurrentStockQty(@Param("storeId") long storeId, @Param("productId") long productId, @Param("newQty") int newQty);

    void insertInventory(@Param("storeId") long storeId, @Param("productId") long productId, @Param("currentStockQty") int currentStockQty, @Param("safetyStockQty") int safetyStockQty, @Param("autoOrderQty") int autoOrderQty);

    void insertInventoryLog(@Param("storeId") long storeId, @Param("productId") long productId, @Param("changeType") String changeType, @Param("beforeQty") int beforeQty, @Param("changeQty") int changeQty, @Param("resultQty") int resultQty);

    List<com.brewflow.api.domain.InventoryLog> findInventoryLogs(
            @Param("storeId") long storeId,
            @Param("productId") Long productId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    long countInventoryLogs(@Param("storeId") long storeId, @Param("productId") Long productId);

    void deleteInventory(@Param("storeId") long storeId, @Param("productId") long productId);
}
