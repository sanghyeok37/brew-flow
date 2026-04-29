package com.brewflow.api.mapper;

import com.brewflow.api.domain.Attachment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AttachmentMapper {
    void insert(Attachment attachment);
    Attachment findById(Long attachmentId);
    List<Attachment> findByParent(@Param("category") String category, @Param("parentId") Long parentId);
    void update(Attachment attachment);
    void delete(Long attachmentId);
    void deleteByParent(@Param("category") String category, @Param("parentId") Long parentId);
}
