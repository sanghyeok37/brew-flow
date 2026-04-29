package com.brewflow.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-path:brewflow_uploads/}")
    private String uploadRoot;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String userHome = System.getProperty("user.home");
        // 파일 시스템의 절대 경로를 리소스로 매핑
        // 예: user.home/brewflow_uploads/ -> http://localhost:8080/brewflow_uploads/
        String resourcePath = "file:" + userHome + "/" + uploadRoot;
        
        registry.addResourceHandler("/" + uploadRoot + "**")
                .addResourceLocations(resourcePath);
    }
}
