package com.brewflow.api.config.security;
 
public class SecurityUtils {
 
    private SecurityUtils() {
    }
 
    public static long currentUserId() {
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof com.brewflow.api.config.security.AuthenticatedUser)) {
            throw new com.brewflow.api.exception.UnauthorizedException("unauthorized");
        }
        
        com.brewflow.api.config.security.AuthenticatedUser u = (com.brewflow.api.config.security.AuthenticatedUser) auth.getPrincipal();
        return u.getUserId();
    }

    public static void assertAnyRole(com.brewflow.api.type.UserRole... roles) {
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof com.brewflow.api.config.security.AuthenticatedUser)) {
            throw new com.brewflow.api.exception.UnauthorizedException("unauthorized");
        }
        
        com.brewflow.api.config.security.AuthenticatedUser u = (com.brewflow.api.config.security.AuthenticatedUser) auth.getPrincipal();
        
        boolean hasMatch = false;
        for (com.brewflow.api.type.UserRole role : roles) {
            if (role == u.getRole()) {
                hasMatch = true;
                break;
            }
        }
        
        if (!hasMatch) {
            throw new com.brewflow.api.exception.BusinessException(com.brewflow.api.type.ErrorCode.FORBIDDEN);
        }
    }
}
