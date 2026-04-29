package com.brewflow.api.service;

import com.brewflow.api.domain.Product;
import com.brewflow.api.domain.Category;
import com.brewflow.api.dto.request.ProductRequest;
import java.util.List;

public interface ProductService {
    Product createProduct(ProductRequest request, long userId);
    Product updateProduct(Long productId, ProductRequest request);
    Product getProductById(Long productId);
    void deleteProduct(Long productId);
    List<Category> getAllCategories();
    com.brewflow.api.dto.response.PageResponse<com.brewflow.api.domain.Product> getAvailableProducts(long userId, String scope, int page, int size);
}
