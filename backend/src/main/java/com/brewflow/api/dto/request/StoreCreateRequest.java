package com.brewflow.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreCreateRequest {
    @NotBlank(message = "점포명은 필수입니다.")
    private String name;
    
    @NotBlank(message = "브랜드 코드는 필수입니다.")
    private String brandCode;

    @NotBlank(message = "점포 코드는 필수입니다.")
    private String storeCode;
    
    private String address;
    private String contact;
}
