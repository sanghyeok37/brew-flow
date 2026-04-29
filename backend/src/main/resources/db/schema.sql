-- =====================================================
-- BrewFlow — 엔터프라이즈 프랜차이즈 재고 관리 시스템 DDL
-- =====================================================

-- 1. 점포 (Stores)
CREATE TABLE stores (
    store_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    -- 코드 체계: 브랜드(3자) + 점포번호(5자)
    store_code  VARCHAR(20)  NOT NULL UNIQUE CHECK (REGEXP_LIKE(store_code, '^[A-Z0-9]{3}[0-9]{5}$')),
    -- 브랜드 코드 자동 추출 (DB 레벨 무결성 보장)
    brand_code  CHAR(3)      GENERATED ALWAYS AS (LEFT(store_code, 3)) STORED,
    name        VARCHAR(120)  NOT NULL UNIQUE CHECK(REGEXP_LIKE(name, '^[가-힣a-zA-Z0-9 ().,-]{3,40}$')),
    -- SYSTEM: 시스템(ADM12345), HQ: 본사(00000), STORE: 가맹점(그 외)
    type        VARCHAR(20)  NOT NULL DEFAULT 'STORE' CHECK (type IN ('SYSTEM', 'HQ', 'STORE')),
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 2. 사용자 (Users)
CREATE TABLE users (
    user_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(20)  NOT NULL UNIQUE CHECK(REGEXP_LIKE(username, '^[a-zA-Z][a-zA-Z0-9]{4,19}$')), 
    name        VARCHAR(18)  NOT NULL CHECK(REGEXP_LIKE(name, '^[가-힣]{2,6}$')),
    nickname    VARCHAR(30)  NOT NULL UNIQUE CHECK(REGEXP_LIKE(nickname, '^[가-힣a-zA-Z0-9]{2,10}$')),
    contact     VARCHAR(11)  NOT NULL CHECK(REGEXP_LIKE(contact, '^010[0-9]{8}$')),
    email       VARCHAR(100) NOT NULL UNIQUE CHECK(REGEXP_LIKE(email, '^[A-Za-z0-9.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
    password    VARCHAR(255) NOT NULL,
    -- SUPER(전체 관리), ADMIN(브랜드 본사), USER(일반 점포)
    role        VARCHAR(20)  NOT NULL DEFAULT 'STORE' CHECK (role IN ('SYSTEM', 'HQ', 'STORE')),
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 3. 유저-점포 매핑 (Users-Stores, 멀티 스토어 대응)
CREATE TABLE users_stores (
    user_store_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    store_id       BIGINT NOT NULL,
    created_at     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_user_store (user_id, store_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- 4. Refresh Token
CREATE TABLE refresh_tokens (
    token_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    token      VARCHAR(512) NOT NULL,
    expires_at DATETIME(3)  NOT NULL,
    created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. 카테고리 (Categories)
CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

-- 6. 상품/원재료 마스터 (Products)
CREATE TABLE products (
    product_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT      NOT NULL,
    brand_code  CHAR(3), -- NULL이면 시스템 공용, 값이 있으면 해당 브랜드 전용
    name        VARCHAR(100) NOT NULL,
    unit        VARCHAR(20)  NOT NULL,
    unit_cost   INT          NOT NULL CHECK (unit_cost >= 0),
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISCONTINUED')),
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

-- 7. 점포별 재고 (Store Inventory)
CREATE TABLE store_inventory (
    inventory_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id          BIGINT   NOT NULL,
    product_id        BIGINT   NOT NULL,
    current_stock_qty INT      NOT NULL DEFAULT 0 CHECK (current_stock_qty >= 0),
    safety_stock_qty  INT      NOT NULL DEFAULT 0 CHECK (safety_stock_qty >= 0),
    auto_order_qty    INT      NOT NULL DEFAULT 1 CHECK (auto_order_qty > 0),
    created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_store_product (store_id, product_id),
    FOREIGN KEY (store_id)   REFERENCES stores(store_id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 8. 재고 로그 (Inventory Logs)
CREATE TABLE inventory_logs (
    log_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id    BIGINT      NOT NULL,
    product_id  BIGINT      NOT NULL,
    change_type VARCHAR(30) NOT NULL,
    before_qty  INT         NOT NULL CHECK (before_qty >= 0),
    change_qty  INT         NOT NULL,
    result_qty  INT         NOT NULL CHECK (result_qty >= 0),
    created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (store_id)   REFERENCES stores(store_id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 9. 발주서 (Purchase Orders)
CREATE TABLE purchase_orders (
    po_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id      BIGINT   NOT NULL,
    total_amount  INT      NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ORDERED', 'DELIVERED', 'CANCELED')),
    ordered_at    DATETIME(3),
    delivered_at  DATETIME(3),
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
    unit_cost_snapshot INT    NOT NULL CHECK (unit_cost_snapshot >= 0),
    UNIQUE KEY uk_po_product (po_id, product_id),
    FOREIGN KEY (po_id)       REFERENCES purchase_orders(po_id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(product_id)      ON DELETE RESTRICT
);

-- 11. 주간 발주 통계 (Weekly Stats)
CREATE TABLE po_weekly_stats (
    stat_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id          BIGINT NOT NULL,
    base_week         DATE   NOT NULL,
    total_po_count    INT    NOT NULL DEFAULT 0 CHECK (total_po_count >= 0),
    total_po_amount   INT    NOT NULL DEFAULT 0 CHECK (total_po_amount >= 0),
    created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_store_week (store_id, base_week),
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- 12. 회원가입 인증 (Cert)
CREATE TABLE cert (
    email       VARCHAR(100) PRIMARY KEY,
    cert_number CHAR(8)      NOT NULL,
    cert_time   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    expires_at  DATETIME(3)  GENERATED ALWAYS AS (DATE_ADD(cert_time, INTERVAL 10 MINUTE)) STORED
);

-- 13. 첨부파일 (Attachments)
CREATE TABLE attachments (
    attachment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_type    VARCHAR(50) NOT NULL,
    category      VARCHAR(50) NOT NULL,
    parent_id     BIGINT      NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name   VARCHAR(255),
    file_path     VARCHAR(500),
    file_size     BIGINT      NOT NULL,
    created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

-- 14. 주문 상세 조회용 View (Read-only)
CREATE OR REPLACE VIEW v_purchase_order_details AS
SELECT 
    o.po_id,
    o.store_id,
    o.total_amount,
    o.status,
    o.ordered_at,
    o.delivered_at,
    o.created_at as order_created_at,
    i.product_id,
    p.name as product_name,
    p.unit,
    i.order_qty,
    i.unit_cost_snapshot
FROM purchase_orders o
JOIN purchase_order_items i ON o.po_id = i.po_id
JOIN products p ON i.product_id = p.product_id;

-- 15. 점포 및 점주 정보 통합 조회용 View (Read-only)
-- 목적: 관리자/본사 페이지에서 점포 현황과 해당 점포의 점주 연락처 등을 통합하여 보여줌
CREATE OR REPLACE VIEW v_store_management AS 
SELECT 
    s.store_id, 
    s.brand_code, 
    s.name, 
    s.store_code, 
    s.type, 
    s.status,
    u.user_id AS owner_id, 
    u.name AS owner_name, 
    u.email AS owner_email, 
    u.contact AS owner_contact, 
    u.username AS owner_username 
FROM stores s 
LEFT JOIN users_stores us ON s.store_id = us.store_id 
LEFT JOIN users u ON us.user_id = u.user_id;

-- 성능 인덱스
CREATE INDEX idx_attachment_lookup ON attachments (category, parent_id);
CREATE INDEX idx_po_store_status ON purchase_orders (store_id, status);
CREATE INDEX idx_inv_log_lookup ON inventory_logs (store_id, created_at DESC);
CREATE INDEX idx_inv_store_product ON store_inventory (store_id, product_id);
CREATE INDEX idx_store_code ON stores (store_code);
CREATE INDEX idx_store_brand ON stores (brand_code);

