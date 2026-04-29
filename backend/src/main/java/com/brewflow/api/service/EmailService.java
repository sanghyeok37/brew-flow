package com.brewflow.api.service;

public interface EmailService {
    void sendCertEmail(String to, String certNumber);
}
