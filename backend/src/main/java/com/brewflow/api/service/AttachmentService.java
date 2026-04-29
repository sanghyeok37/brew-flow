package com.brewflow.api.service;

import com.brewflow.api.domain.Attachment;
import com.brewflow.api.exception.BusinessException;
import com.brewflow.api.mapper.AttachmentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentMapper attachmentMapper;

    @Value("${file.upload-path:brewflow_uploads/}")
    private String uploadRoot;

    private final String userHome = System.getProperty("user.home");

    /**
     * 파일 저장 (Upload)
     * @param file 멀티파트 파일
     * @param category 카테고리 (PRODUCT, PROFILE 등)
     * @param parentId 연결될 도메인의 PK (Long)
     */
    @Transactional(rollbackFor = Exception.class)
    public Attachment save(MultipartFile file, String category, Long parentId) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 1. 먼저 DB에 정보를 인서트하여 attachment_id를 생성함
        Attachment attachment = Attachment.builder()
                .mediaType(file.getContentType())
                .category(category)
                .parentId(parentId)
                .originalName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .build();

        attachmentMapper.insert(attachment);
        Long id = attachment.getAttachmentId();

        // 2. 생성된 ID를 기반으로 파일명 및 경로 확정
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String relativePath = uploadRoot + category + "/" + datePath;
        
        // 파일명 규칙: 카테고리_ID_원본명 (혹은 깔끔하게 ID_원본명)
        String storedName = category + "_" + id + "_" + file.getOriginalFilename();
        File directory = new File(userHome, relativePath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        File target = new File(directory, storedName);

        try {
            // 3. 물리적 파일 저장
            file.transferTo(target);

            // 4. 확정된 파일명과 경로로 DB 업데이트
            attachment.setStoredName(storedName);
            attachment.setFilePath(relativePath + "/" + storedName);
            attachmentMapper.update(attachment);

            return attachment;

        } catch (IOException e) {
            // 물리 파일 저장 실패 시 DB 롤백 및 고아 파일 방지
            if (target.exists()) {
                target.delete();
            }
            log.error("File upload failed: {}", e.getMessage());
            throw new BusinessException("파일 저장 중 오류가 발생했습니다.");
        } catch (Exception e) {
            if (target.exists()) {
                target.delete();
            }
            log.error("Database update error during file upload: {}", e.getMessage());
            throw new BusinessException("파일 정보 업데이트 중 오류가 발생했습니다.");
        }
    }

    /**
     * 특정 부모에 연결된 파일 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Attachment> getAttachments(String category, Long parentId) {
        return attachmentMapper.findByParent(category, parentId);
    }

    /**
     * 파일 단건 삭제
     */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long attachmentId) {
        Attachment attachment = attachmentMapper.findById(attachmentId);
        if (attachment == null) {
            return;
        }

        // 물리 파일 삭제
        File target = new File(userHome, attachment.getFilePath());
        if (target.exists()) {
            if (!target.delete()) {
                log.warn("Failed to delete physical file: {}", target.getAbsolutePath());
                throw new BusinessException("물리 파일 삭제에 실패하여 작업을 중단합니다.");
            }
        }

        // DB 삭제
        attachmentMapper.delete(attachmentId);
    }

    /**
     * 부모 아이디 기준으로 모든 파일 삭제 (예: 상품 삭제 시)
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteByParent(String category, Long parentId) {
        List<Attachment> attachments = attachmentMapper.findByParent(category, parentId);
        for (Attachment attachment : attachments) {
            delete(attachment.getAttachmentId());
        }
    }
}
