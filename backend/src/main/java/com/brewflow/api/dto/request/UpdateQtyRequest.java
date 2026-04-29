package com.brewflow.api.dto.request;
 
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
 
@Data
public class UpdateQtyRequest {
    @NotNull
    @Min(1)
    private Integer orderQty;
}
