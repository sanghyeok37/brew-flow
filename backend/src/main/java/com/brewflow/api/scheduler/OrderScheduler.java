package com.brewflow.api.scheduler;

import com.brewflow.api.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderScheduler {

    private final PurchaseOrderService purchaseOrderService;

    @Scheduled(cron = "${custom.scheduler.threshold-cron:0 0/30 * * * *}")
    public void thresholdCheck() {
        log.debug("thresholdCheck started");
        purchaseOrderService.runThresholdCheck();
    }

    @Scheduled(cron = "${custom.scheduler.pending-to-ordered-cron:0 0 3 * * *}")
    public void pendingToOrdered() {
        log.debug("pendingToOrdered started");
        purchaseOrderService.runPendingToOrdered();
    }
}

