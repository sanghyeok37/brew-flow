package com.brewflow.api.service.impl;

import com.brewflow.api.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Async
    @Override
    public void sendCertEmail(String to, String certNumber) {
        log.info("Starting async email send to {}", to);
        try {
            // 실제 메일 서버 통신은 시간이 걸리므로 비동기로 처리
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, "UTF-8");
            helper.setTo(to);
            helper.setSubject("[BrewFlow] 이메일 인증번호");
            helper.setText("인증번호: " + certNumber + "\n\n유효시간은 10분입니다.", false);

            mailSender.send(msg);
            log.info("Async email sent successfully to {}", to);
        } catch (Exception e) {
            // 비동기 작업이므로 여기서 예외를 잡아 로그를 남김
            log.error("Async email send failed to {}. (Code: {})", to, certNumber, e);
        }
    }
}
