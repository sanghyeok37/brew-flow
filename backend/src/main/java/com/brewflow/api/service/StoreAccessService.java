package com.brewflow.api.service;

import java.util.List;

public interface StoreAccessService {
    void assertUserHasStore(long userId, long storeId);

    List<Long> getUserStoreIds(long userId);
}

