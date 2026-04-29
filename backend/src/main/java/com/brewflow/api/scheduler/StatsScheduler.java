package com.brewflow.api.scheduler;

import com.brewflow.api.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StatsScheduler {

    private final StatsService statsService;

    @Scheduled(cron = "${custom.scheduler.weekly-stats-cron:0 0 0 * * MON}")
    public void weeklyStats() {
        log.debug("weeklyStats started");
        statsService.generateLastWeekStats();
    }
}

