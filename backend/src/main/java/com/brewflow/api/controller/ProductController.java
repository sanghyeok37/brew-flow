package com.brewflow.api.controller;
 
import com.brewflow.api.config.security.SecurityUtils;
import com.brewflow.api.domain.Category;
import com.brewflow.api.domain.Product;
import com.brewflow.api.dto.request.ProductRequest;
import com.brewflow.api.dto.response.ApiResponse;
import com.brewflow.api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
 
    private final ProductService productService;
 
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllCategories()));
    }
 
    @GetMapping
    public ResponseEntity<ApiResponse<com.brewflow.api.dto.response.PageResponse<Product>>> getAllProducts(
            @RequestParam(name = "scope", defaultValue = "all") String scope,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(productService.getAvailableProducts(userId, scope, page, size)));
    }
 
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<Product>> getProduct(@PathVariable(name = "productId") Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(productId)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('HQ', 'SYSTEM')")
    public ResponseEntity<ApiResponse<Product>> createProduct(@ModelAttribute ProductRequest request) {
        long userId = SecurityUtils.currentUserId();
        return ResponseEntity.ok(ApiResponse.ok(productService.createProduct(request, userId)));
    }

    @PutMapping(value = "/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('HQ', 'SYSTEM')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable(name = "productId") Long productId,
            @ModelAttribute ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.updateProduct(productId, request)));
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasAnyRole('HQ', 'SYSTEM')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable(name = "productId") Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
