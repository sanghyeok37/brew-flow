package com.brewflow.api.service.impl;

import com.brewflow.api.type.ProductStatus;
import com.brewflow.api.domain.Category;
import com.brewflow.api.domain.Product;
import com.brewflow.api.mapper.CategoryMapper;
import com.brewflow.api.mapper.ProductMapper;
import com.brewflow.api.dto.request.ProductRequest;
import com.brewflow.api.mapper.AuthMapper;
import com.brewflow.api.service.AttachmentService;
import com.brewflow.api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final AttachmentService attachmentService;
    private final AuthMapper authMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Product createProduct(ProductRequest request, long userId) {
        // 사용자의 대표 점포 정보를 조회하여 브랜드 코드를 가져옴 (비즈니스 로직)
        String brandCode = authMapper.findMainStoreByUserId(userId)
                .map(com.brewflow.api.domain.Store::getBrandCode)
                .orElse(null);

        Product product = Product.builder()
                .name(request.getName())
                .categoryId(request.getCategoryId())
                .brandCode(brandCode)
                .unit(request.getUnit())
                .unitCost(request.getUnitCost())
                .status(ProductStatus.ACTIVE)
                .build();

        productMapper.insert(product);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            attachmentService.save(request.getImage(), "PRODUCT", product.getProductId());
        }

        return product;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProduct(Long productId) {
        // 1. 첨부파일 삭제
        attachmentService.deleteByParent("PRODUCT", productId);

        // 2. 상품 삭제
        productMapper.delete(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryMapper.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Product getProductById(Long productId) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }
        return product;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Product updateProduct(Long productId, ProductRequest request) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }

        product.setName(request.getName());
        product.setCategoryId(request.getCategoryId());
        product.setUnit(request.getUnit());
        product.setUnitCost(request.getUnitCost());

        productMapper.update(product);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            attachmentService.deleteByParent("PRODUCT", productId);
            attachmentService.save(request.getImage(), "PRODUCT", productId);
        }

        return product;
    }

    @Override
    @Transactional(readOnly = true)
    public com.brewflow.api.dto.response.PageResponse<Product> getAvailableProducts(long userId, String scope, int page,
            int size) {
        com.brewflow.api.domain.User user = authMapper.findUserById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String userBrand = authMapper.findMainStoreByUserId(userId)
                .map(com.brewflow.api.domain.Store::getBrandCode)
                .orElse(null);

        String targetBrand = null;
        boolean includeCommon = false;

        String role = user.getRole().name();
        
        if ("common".equals(scope)) {
            // 'ADM' is treated as the common brand in this system
            targetBrand = "ADM";
            includeCommon = true; // Still include NULL entries just in case
        } else if ("brand".equals(scope)) {
            // Only brand products for this user's brand
            targetBrand = userBrand;
            includeCommon = false;
        } else {
            // Role-based default filtering (all available)
            if ("SYSTEM".equals(role)) {
                // SYSTEM sees everything (ADM + Common)
                targetBrand = "ADM";
                includeCommon = true;
            } else if ("HQ".equals(role)) {
                // HQ sees only their brand products
                targetBrand = userBrand;
                includeCommon = false;
            } else if ("STORE".equals(role)) {
                // STORE sees both common (ADM) and their brand products
                targetBrand = userBrand; // This will filter by their brand
                includeCommon = true;  // This will include NULL (but we also want ADM)
            }
        }

        // Final refinement for ADM as common
        // If includeCommon is true and targetBrand is not ADM, 
        // the current Mapper XML logic only does (brand_code = targetBrand OR brand_code IS NULL).
        // We might need to adjust the Mapper or set targetBrand differently.
        
        int offset = page * size;
        List<Product> content = productMapper.findAvailableProducts(targetBrand, includeCommon, size, offset);
        long total = productMapper.countAvailableProducts(targetBrand, includeCommon);

        return com.brewflow.api.dto.response.PageResponse.of(content, page, size, total);
    }
}
