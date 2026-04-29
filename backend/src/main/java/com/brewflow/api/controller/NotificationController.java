package com.brewflow.api.controller;

import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.notification.SseEmitterManager;
import com.brewflow.api.service.StoreAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final StoreAccessService storeAccessService;
    private final SseEmitterManager emitterManager;

    @GetMapping("/subscribe")
    public SseEmitter subscribe() {
        long userId = SecurityUtils.currentUserId();
        List<Long> storeIds = storeAccessService.getUserStoreIds(userId);

        SseEmitter emitter = new SseEmitter(Duration.ofHours(6).toMillis());
        for (Long storeId : storeIds) {
            emitterManager.register(storeId, emitter);
        }

        emitter.onCompletion(() -> storeIds.forEach(id -> emitterManager.remove(id, emitter)));
        emitter.onTimeout(() -> storeIds.forEach(id -> emitterManager.remove(id, emitter)));
        emitter.onError(ex -> storeIds.forEach(id -> emitterManager.remove(id, emitter)));

        try {
            emitter.send(SseEmitter.event().name("connected").data("connected"));
        } catch (Exception ignored) {
        }
        return emitter;
    }
}

