package com.brewflow.api.mapper;

import com.brewflow.api.domain.PurchaseOrder;
import com.brewflow.api.domain.PurchaseOrderItem;
import com.brewflow.api.domain.PurchaseOrderView;
import com.brewflow.api.dto.response.MonthlyProductSummary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PurchaseOrderMapper {

    Optional<Long> findPendingPoIdByStoreAndProduct(@Param("storeId") long storeId, @Param("productId") long productId);

    void insertPurchaseOrder(PurchaseOrder order);

    void insertPurchaseOrderItem(PurchaseOrderItem item);

    List<Long> findOrderIdsByStore(
            @Param("storeId") long storeId,
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    List<PurchaseOrderView> findOrdersByIds(@Param("poIds") List<Long> poIds);

    long countOrdersByStore(
            @Param("storeId") long storeId,
            @Param("status") String status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    long countOrdersByStatuses(
            @Param("storeId") long storeId,
            @Param("statuses") List<String> statuses
    );

    List<PurchaseOrderView.PurchaseOrderItemView> findOrderItems(@Param("poId") long poId);

    Optional<PurchaseOrderView> findOrderHeaderForUpdate(@Param("poId") long poId);

    void updateOrderTotalAmount(@Param("poId") long poId, @Param("totalAmount") int totalAmount);

    void updateOrderItemQty(@Param("poId") long poId, @Param("productId") long productId, @Param("orderQty") int orderQty);

    void cancelPending(@Param("poId") long poId);

    List<Long> findPendingPoIds();

    void markOrdered(@Param("poId") long poId, @Param("orderedAt") LocalDateTime orderedAt);

    Optional<String> findOrderStatus(@Param("poId") long poId);

    void markDelivered(@Param("poId") long poId, @Param("deliveredAt") LocalDateTime deliveredAt);

    List<PurchaseOrderItem> findItemsForInbound(@Param("poId") long poId);

    PurchaseOrderView findOrderById(@Param("poId") long poId);

    Long getMonthlyOrderAmount(
            @Param("storeId") long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    Long getMonthlyOrderAmountByStatuses(
            @Param("storeId") long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("statuses") List<String> statuses
    );

    List<MonthlyProductSummary> getMonthlyProductSummaries(
            @Param("storeId") long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    void deleteOrder(@Param("poId") long poId);
}
