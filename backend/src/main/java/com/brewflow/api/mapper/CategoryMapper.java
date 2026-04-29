package com.brewflow.api.mapper;

import com.brewflow.api.domain.Category;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CategoryMapper {
    List<Category> findAll();
    Category findById(Long categoryId);
}
