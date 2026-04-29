package com.brewflow.api.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {
    private Long attachmentId;
    private String mediaType;
    private String category;
    private Long parentId;
    private String originalName;
    private String storedName;
    private String filePath;
    private Long fileSize;
    private LocalDateTime createdAt;
}
