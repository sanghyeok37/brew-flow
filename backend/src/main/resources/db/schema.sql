-- =====================================================
-- 카페 자동발주 및 점포 관리 시스템 DDL
-- =====================================================

-- 1. 점포 (Stores)
CREATE TABLE stores (
    store_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_code  VARCHAR(20)  NOT NULL UNIQUE CHECK (REGEXP_LIKE(store_code, '^[A-Z0-9]{6}$')),
    name   VARCHAR(60) NOT NULL UNIQUE CHECK(REGEXP_LIKE(name, '^[가-힣a-zA-Z0-9]{3,20}$')),
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 2. 사용자 (Users)
CREATE TABLE users (
	user_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(20) NOT NULL UNIQUE CHECK(REGEXP_LIKE(username, '^[a-z][a-z0-9]{4,19}$')), 
    name VARCHAR(18) NOT NULL CHECK(REGEXP_LIKE(name, '^[가-힣]{2,6}$')),
    nickname VARCHAR(30) NOT NULL UNIQUE CHECK(REGEXP_LIKE(nickname, '^[가-힣a-zA-Z0-9]{2,10}$')),
    contact  VARCHAR(13) NOT NULL CHECK(REGEXP_LIKE(contact, '^010-[1-9][0-9]{3}-[0-9]{4}$')),
    email      VARCHAR(100) NOT NULL UNIQUE CHECK(REGEXP_LIKE(email, '^[A-Za-z0-9.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
    password   VARCHAR(255) NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 3. 유저-점포 매핑 (User-Store, 조인 테이블)
-- 한 유저가 여러 점포 관리 가능한 확장성 고려
CREATE TABLE user_stores (
    user_store_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT   NOT NULL,
    store_id   BIGINT   NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_user_store (user_id, store_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- 4. Refresh Token (JWT)
CREATE TABLE refresh_tokens (
    token_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    token      VARCHAR(512) NOT NULL,
    expires_at DATETIME(3)     NOT NULL,
    created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. 카테고리 (Categories)
CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

-- 6. 상품/원재료 마스터 (Products)
-- 목 데이터 기반, Create/Update API 없음 (Read Only)
CREATE TABLE products (
    product_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT      NOT NULL,
    name        VARCHAR(100) NOT NULL,
    unit        VARCHAR(20)  NOT NULL,                          -- 봉지, 병, 개 등
    unit_cost   INT          NOT NULL CHECK (unit_cost >= 0),   -- 원가 (정산용)
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISCONTINUED')),
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

-- 7. 점포별 재고 및 설정 (Store Inventory)
CREATE TABLE store_inventory (
    inventory_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id          BIGINT   NOT NULL,
    product_id        BIGINT   NOT NULL,
    current_stock_qty INT      NOT NULL DEFAULT 0 CHECK (current_stock_qty >= 0),   -- 현재 재고 (절대 마이너스 불가)
    safety_stock_qty  INT      NOT NULL DEFAULT 0 CHECK (safety_stock_qty >= 0),    -- 임계치
    auto_order_qty    INT      NOT NULL DEFAULT 1 CHECK (auto_order_qty > 0),        -- 1회 발주 수량 (최소 1 이상)
    created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_store_product (store_id, product_id),
    FOREIGN KEY (store_id)   REFERENCES stores(store_id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 8. 재고 수불부 / 로그 (Inventory Logs)
-- change_qty: 차감 음수(-), 입고 양수(+)
CREATE TABLE inventory_logs (
    log_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id    BIGINT      NOT NULL,
    product_id  BIGINT      NOT NULL,
    change_type VARCHAR(30) NOT NULL CHECK (change_type IN (
        'MANUAL_DEDUCT',    -- 수동 차감 (시연용 버튼 포함)
        'DELIVERED_INBOUND',-- 발주 DELIVERED 시 재고 증가
        'INITIAL_SETTING'   -- 초기 재고 세팅
    )),
    before_qty  INT         NOT NULL CHECK (before_qty >= 0),
    change_qty  INT         NOT NULL,                           -- 차감: 음수, 입고: 양수
    result_qty  INT         NOT NULL CHECK (result_qty >= 0),   -- 변경 후 최종 수량 스냅샷
    created_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (store_id)   REFERENCES stores(store_id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 9. 발주서 (Purchase Orders)
-- 상태 플로우: PENDING → ORDERED → DELIVERED (CANCELED 가능)
CREATE TABLE purchase_orders (
    po_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id      BIGINT   NOT NULL,
    total_amount  INT      NOT NULL DEFAULT 0 CHECK (total_amount >= 0),  -- 발주 총액
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ORDERED', 'DELIVERED', 'CANCELED')),
    ordered_at    DATETIME(3),    -- 스케줄러가 ORDERED 처리한 시점
    delivered_at  DATETIME(3),    -- DELIVERED 처리 시점 (재고 증가 트리거)
    created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE RESTRICT
);

-- 10. 발주 상품 목록 (Purchase Order Items)
CREATE TABLE purchase_order_items (
    po_item_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_id              BIGINT NOT NULL,
    product_id         BIGINT NOT NULL,
    order_qty          INT    NOT NULL CHECK (order_qty > 0),
    unit_cost_snapshot INT    NOT NULL CHECK (unit_cost_snapshot >= 0),  -- 발주 시점 단가 스냅샷
    UNIQUE KEY uk_po_product (po_id, product_id),
    FOREIGN KEY (po_id)       REFERENCES purchase_orders(po_id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(product_id)      ON DELETE RESTRICT
);

-- 11. 주간 발주 통계 (Weekly Stats)
-- 매주 월요일 크론으로 집계
CREATE TABLE po_weekly_stats (
    stat_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id          BIGINT NOT NULL,
    base_week         DATE   NOT NULL,                                              -- 해당 주 월요일 날짜
    total_po_count    INT    NOT NULL DEFAULT 0 CHECK (total_po_count >= 0),
    total_po_amount   INT    NOT NULL DEFAULT 0 CHECK (total_po_amount >= 0),
    created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_store_week (store_id, base_week),
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- 12. 회원가입 시 인증
CREATE TABLE cert(
	email VARCHAR(100) PRIMARY KEY,
	cert_number CHAR(6) NOT NULL, 
	cert_time  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	expires_at  DATETIME(3) GENERATED ALWAYS AS (DATE_ADD(cert_time, INTERVAL 10 MINUTE)) STORED
);
