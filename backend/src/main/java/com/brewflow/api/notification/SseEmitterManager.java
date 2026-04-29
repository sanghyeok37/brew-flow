package com.brewflow.api.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class SseEmitterManager {

    private final ConcurrentHashMap<Long, Set<SseEmitter>> emittersByStoreId = new ConcurrentHashMap<>();

    public void register(long storeId, SseEmitter emitter) {
        emittersByStoreId.computeIfAbsent(storeId, k -> ConcurrentHashMap.newKeySet()).add(emitter);
    }

    public void remove(long storeId, SseEmitter emitter) {
        Set<SseEmitter> set = emittersByStoreId.get(storeId);
        if (set == null) return;
        set.remove(emitter);
        if (set.isEmpty()) {
            emittersByStoreId.remove(storeId);
        }
    }

    public void send(long storeId, String message) {
        Set<SseEmitter> set = emittersByStoreId.get(storeId);
        if (set == null || set.isEmpty()) return;

        for (SseEmitter emitter : set) {
            try {
                emitter.send(SseEmitter.event().name("message").data(message));
            } catch (IOException e) {
                log.debug("SSE send failed, removing emitter: {}", e.getMessage());
                remove(storeId, emitter);
            }
        }
    }

    public void sendEvent(long storeId, String eventName, Object data) {
        Set<SseEmitter> set = emittersByStoreId.get(storeId);
        if (set == null || set.isEmpty()) return;

        for (SseEmitter emitter : set) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                log.debug("SSE sendEvent failed, removing emitter: {}", e.getMessage());
                remove(storeId, emitter);
            }
        }
    }
}

