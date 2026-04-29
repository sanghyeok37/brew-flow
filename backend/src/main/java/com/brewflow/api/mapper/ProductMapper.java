package com.brewflow.api.mapper;

import com.brewflow.api.domain.Product;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ProductMapper {
    void insert(Product product);
    void update(Product product);
    Product findById(Long productId);
    List<Product> findAvailableProducts(
        @org.apache.ibatis.annotations.Param("brandCode") String brandCode, 
        @org.apache.ibatis.annotations.Param("includeCommon") boolean includeCommon,
        @org.apache.ibatis.annotations.Param("limit") int limit, 
        @org.apache.ibatis.annotations.Param("offset") int offset
    );
    long countAvailableProducts(
        @org.apache.ibatis.annotations.Param("brandCode") String brandCode,
        @org.apache.ibatis.annotations.Param("includeCommon") boolean includeCommon
    );
    void delete(Long productId);
}
