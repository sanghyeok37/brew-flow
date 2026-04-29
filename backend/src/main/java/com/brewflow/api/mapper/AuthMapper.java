package com.brewflow.api.mapper;

import com.brewflow.api.domain.Cert;
import com.brewflow.api.domain.RefreshToken;
import com.brewflow.api.domain.Store;
import com.brewflow.api.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface AuthMapper {

    Optional<User> findUserByUsername(String username);

    Optional<User> findUserByEmail(String email);
    Optional<User> findUserById(long userId);

    long insertUser(User user);

    Optional<Store> findStoreById(long storeId);

    Optional<Store> findStoreByCode(String storeCode);

    Optional<Long> findStoreIdByStoreCode(String storeCode);

    void insertUsersStores(@Param("userId") long userId, @Param("storeId") long storeId);

    List<Long> findStoreIdsByUserId(long userId);

    Optional<Store> findMainStoreByUserId(long userId);

    void insertCert(Cert cert);

    Optional<Cert> findCertByEmail(String email);

    void deleteCertByEmail(String email);

    void insertRefreshToken(RefreshToken token);

    Optional<RefreshToken> findRefreshToken(String token);

    void deleteRefreshTokensByUserId(@Param("userId") long userId);

    void deleteRefreshToken(String token);

    void updateUserPassword(@Param("userId") long userId, @Param("encodedPassword") String encodedPassword);
    void updateUser(User user);

    void deleteExpiredRefreshTokens(@Param("now") LocalDateTime now);
    void deleteExpiredCerts(@Param("now") LocalDateTime now);
}
