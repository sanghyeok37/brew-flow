-- =====================================================
-- BrewFlow Demo Data (DML)
-- =====================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE po_weekly_stats;
TRUNCATE TABLE inventory_logs;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE store_inventory;
TRUNCATE TABLE attachments;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE users_stores;
TRUNCATE TABLE stores;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. 본사 및 시스템 계정 (시스템 관리용)
INSERT INTO stores (store_code, name, type, status) VALUES 
('ADM12345', 'BrewFlow Global System', 'SYSTEM', 'OPEN'),
('STB00000', 'Starbucks HQ Korea', 'HQ', 'OPEN'),
('EDI00000', 'Ediya Coffee HQ', 'HQ', 'OPEN'),
('MEG00000', '메가커피 본사', 'HQ', 'OPEN'),
('PAI00000', '빽다방 본사', 'HQ', 'OPEN'),
('TWO00000', '투썸플레이스 본사', 'HQ', 'OPEN'),
('CAF00000', '카페베네 본사', 'HQ', 'OPEN');

-- 2. 가맹점 (브랜드별 15개씩, 총 75개 점포 생성)
INSERT INTO stores (store_code, name, type, status) VALUES 
-- 스타벅스 (STB)
('STB00001', '스타벅스 강남역점', 'STORE', 'OPEN'), ('STB00002', '스타벅스 역삼점', 'STORE', 'OPEN'), ('STB00003', '스타벅스 삼성점', 'STORE', 'OPEN'), ('STB00004', '스타벅스 선릉점', 'STORE', 'OPEN'), ('STB00005', '스타벅스 한남점', 'STORE', 'OPEN'),
('STB00006', '스타벅스 청담점', 'STORE', 'OPEN'), ('STB00007', '스타벅스 압구정점', 'STORE', 'OPEN'), ('STB00008', '스타벅스 가로수길점', 'STORE', 'OPEN'), ('STB00009', '스타벅스 홍대입구점', 'STORE', 'OPEN'), ('STB00010', '스타벅스 연남점', 'STORE', 'OPEN'),
('STB00011', '스타벅스 이태원점', 'STORE', 'OPEN'), ('STB00012', '스타벅스 성수점', 'STORE', 'OPEN'), ('STB00013', '스타벅스 잠실점(폐점)', 'STORE', 'CLOSED'), ('STB00014', '스타벅스 방이점(폐점)', 'STORE', 'CLOSED'), ('STB00015', '스타벅스 천호점(폐점)', 'STORE', 'CLOSED'),

-- 이디야 (EDI)
('EDI00001', '이디야 상암점', 'STORE', 'OPEN'), ('EDI00002', '이디야 역삼점', 'STORE', 'OPEN'), ('EDI00003', '이디야 한남점', 'STORE', 'OPEN'), ('EDI00004', '이디야 서초점', 'STORE', 'OPEN'), ('EDI00005', '이디야 마포점', 'STORE', 'OPEN'),
('EDI00006', '이디야 공덕점', 'STORE', 'OPEN'), ('EDI00007', '이디야 용산점', 'STORE', 'OPEN'), ('EDI00008', '이디야 신촌점', 'STORE', 'OPEN'), ('EDI00009', '이디야 이대점', 'STORE', 'OPEN'), ('EDI00010', '이디야 종로점', 'STORE', 'OPEN'),
('EDI00011', '이디야 명동점', 'STORE', 'OPEN'), ('EDI00012', '이디야 을지로점', 'STORE', 'OPEN'), ('EDI00013', '이디야 충무로점(폐점)', 'STORE', 'CLOSED'), ('EDI00014', '이디야 동대문점(폐점)', 'STORE', 'CLOSED'), ('EDI00015', '이디야 신당점(폐점)', 'STORE', 'CLOSED'),

-- 메가커피 (MEG)
('MEG00001', '메가커피 대치점', 'STORE', 'OPEN'), ('MEG00002', '메가커피 목동점', 'STORE', 'OPEN'), ('MEG00003', '메가커피 분당점', 'STORE', 'OPEN'), ('MEG00004', '메가커피 판교점', 'STORE', 'OPEN'), ('MEG00005', '메가커피 수지점', 'STORE', 'OPEN'),
('MEG00006', '메가커피 일산점', 'STORE', 'OPEN'), ('MEG00007', '메가커피 중동점', 'STORE', 'OPEN'), ('MEG00008', '메가커피 평촌점', 'STORE', 'OPEN'), ('MEG00009', '메가커피 산본점', 'STORE', 'OPEN'), ('MEG00010', '메가커피 광명점', 'STORE', 'OPEN'),
('MEG00011', '메가커피 안양점', 'STORE', 'OPEN'), ('MEG00012', '메가커피 군포점', 'STORE', 'OPEN'), ('MEG00013', '메가커피 의왕점(폐점)', 'STORE', 'CLOSED'), ('MEG00014', '메가커피 과천점(폐점)', 'STORE', 'CLOSED'), ('MEG00015', '메가커피 시흥점(폐점)', 'STORE', 'CLOSED'),

-- 빽다방 (PAI)
('PAI00001', '빽다방 종로점', 'STORE', 'OPEN'), ('PAI00002', '빽다방 혜화점', 'STORE', 'OPEN'), ('PAI00003', '빽다방 수유점', 'STORE', 'OPEN'), ('PAI00004', '빽다방 미아점', 'STORE', 'OPEN'), ('PAI00005', '빽다방 창동점', 'STORE', 'OPEN'),
('PAI00006', '빽다방 노원점', 'STORE', 'OPEN'), ('PAI00007', '빽다방 상계점', 'STORE', 'OPEN'), ('PAI00008', '빽다방 도봉점', 'STORE', 'OPEN'), ('PAI00009', '빽다방 의정부점', 'STORE', 'OPEN'), ('PAI00010', '빽다방 양주점', 'STORE', 'OPEN'),
('PAI00011', '빽다방 포천점', 'STORE', 'OPEN'), ('PAI00012', '빽다방 남양주점', 'STORE', 'OPEN'), ('PAI00013', '빽다방 구리점(폐점)', 'STORE', 'CLOSED'), ('PAI00014', '빽다방 하남점(폐점)', 'STORE', 'CLOSED'), ('PAI00015', '빽다방 성남점(폐점)', 'STORE', 'CLOSED'),

-- 투썸플레이스 (TWO)
('TWO00001', '투썸플레이스 신촌점', 'STORE', 'OPEN'), ('TWO00002', '투썸플레이스 광화문점', 'STORE', 'OPEN'), ('TWO00003', '투썸플레이스 서소문점', 'STORE', 'OPEN'), ('TWO00004', '투썸플레이스 정동점', 'STORE', 'OPEN'), ('TWO00005', '투썸플레이스 명동점', 'STORE', 'OPEN'),
('TWO00006', '투썸플레이스 충무로점', 'STORE', 'OPEN'), ('TWO00007', '투썸플레이스 필동점', 'STORE', 'OPEN'), ('TWO00008', '투썸플레이스 장충점', 'STORE', 'OPEN'), ('TWO00009', '투썸플레이스 약수점', 'STORE', 'OPEN'), ('TWO00010', '투썸플레이스 금호점', 'STORE', 'OPEN'),
('TWO00011', '투썸플레이스 옥수점', 'STORE', 'OPEN'), ('TWO00012', '투썸플레이스 성수점', 'STORE', 'OPEN'), ('TWO00013', '투썸플레이스 건대점(폐점)', 'STORE', 'CLOSED'), ('TWO00014', '투썸플레이스 구의점(폐점)', 'STORE', 'CLOSED'), ('TWO00015', '투썸플레이스 자양점(폐점)', 'STORE', 'CLOSED');

-- 3. 카테고리 (한국어 최적화)
INSERT INTO categories (category_id, name) VALUES 
(1, '원두'), (2, '시럽/소스/파우더'), (3, '우유/유제품'), (4, '소모품/용기'), (5, '베이커리/디저트');

-- 4. 상품 (마스터 상품 30개)
INSERT INTO products (product_id, category_id, brand_code, name, unit, unit_cost) VALUES 
(1, 1, 'ADM', '브루플로우 시그니처 블렌드', 'kg', 25000), (2, 1, 'EDI', '이디야 비니스트 다크', 'kg', 28000), (3, 1, 'STB', '스타벅스 에스프레소 로스트', 'kg', 35000), (4, 1, 'ADM', '에티오피아 예가체프 G1', 'kg', 32000), (5, 1, 'ADM', '디카페인 콜롬비아', 'kg', 30000),
(6, 2, 'ADM', '바닐라 빈 시럽', 'L', 12000), (7, 2, 'ADM', '다크 초콜릿 소스', 'kg', 15000), (8, 2, 'ADM', '카라멜 드리즐', 'kg', 14000), (9, 2, 'ADM', '제주 말차 파우더', 'kg', 22000), (10, 2, 'ADM', '홍차 베이스', 'L', 18000),
(11, 3, 'ADM', '매일우유 바리스타 전용', 'L', 2100), (12, 3, 'ADM', '서울우유 나100%', 'L', 2300), (13, 3, 'ADM', '오트사이드 귀리유', 'L', 4500), (14, 3, 'ADM', '휘핑크림 35%', 'L', 8500), (15, 3, 'ADM', '연유 (가당)', 'kg', 7000),
(16, 4, 'ADM', '16oz 아이스 투명컵', 'box', 45000), (17, 4, 'ADM', '13oz 핫 종이컵', 'box', 42000), (18, 4, 'ADM', '생분해 빨대 (검정)', 'box', 15000), (19, 4, 'ADM', '무지 냅킨 (2겹)', 'box', 22000), (20, 4, 'STB', '스타벅스 로고 홀더', 'box', 38000), (21, 4, 'EDI', '이디야 블루 홀더', 'box', 32000), (22, 4, 'ADM', '캐리어 (4구)', 'box', 28000),
(23, 5, 'ADM', '플레인 크로플 생지', 'ea', 1200), (24, 5, 'ADM', '벨기에 초코 와플', 'ea', 1500), (25, 5, 'ADM', '치즈 케이크 (조각)', 'ea', 3500), (26, 5, 'ADM', '호두 초코칩 쿠키', 'ea', 1800), (27, 5, 'ADM', '샌드위치용 치아바타', 'ea', 2200);

-- 5. 첨부파일 매핑 (카테고리별 마스터 이미지 순환)
-- 5. 첨부파일 매핑 (카테고리별 마스터 이미지 순환)
-- 5. 첨부파일 매핑 (카테고리별 마스터 이미지 - 27개 상품 고유화)
INSERT INTO attachments (media_type, category, parent_id, original_name, stored_name, file_path, file_size) VALUES 
('image/jpeg', 'PRODUCT', 1, 'bean_master1.jpg', 'bean_master1.jpg', 'uploads/PRODUCT/20260430/bean_master1.jpg', 500000), 
('image/jpeg', 'PRODUCT', 2, 'bean_master2.jpg', 'bean_master2.jpg', 'uploads/PRODUCT/20260430/bean_master2.jpg', 500000), 
('image/jpeg', 'PRODUCT', 3, 'bean_master3.jpg', 'bean_master3.jpg', 'uploads/PRODUCT/20260430/bean_master3.jpg', 500000), 
('image/jpeg', 'PRODUCT', 4, 'bean_master4.jpg', 'bean_master4.jpg', 'uploads/PRODUCT/20260430/bean_master4.jpg', 500000), 
('image/jpeg', 'PRODUCT', 5, 'bean_master5.jpg', 'bean_master5.jpg', 'uploads/PRODUCT/20260430/bean_master5.jpg', 500000),
('image/jpeg', 'PRODUCT', 6, 'syrup_master1.jpg', 'syrup_master1.jpg', 'uploads/PRODUCT/20260430/syrup_master1.jpg', 500000), 
('image/jpeg', 'PRODUCT', 7, 'syrup_master2.jpg', 'syrup_master2.jpg', 'uploads/PRODUCT/20260430/syrup_master2.jpg', 500000), 
('image/jpeg', 'PRODUCT', 8, 'syrup_master3.jpg', 'syrup_master3.jpg', 'uploads/PRODUCT/20260430/syrup_master3.jpg', 500000), 
('image/jpeg', 'PRODUCT', 9, 'syrup_master4.jpg', 'syrup_master4.jpg', 'uploads/PRODUCT/20260430/syrup_master4.jpg', 500000), 
('image/jpeg', 'PRODUCT', 10, 'syrup_master5.jpg', 'syrup_master5.jpg', 'uploads/PRODUCT/20260430/syrup_master5.jpg', 500000),
('image/jpeg', 'PRODUCT', 11, 'milk_master1.jpg', 'milk_master1.jpg', 'uploads/PRODUCT/20260430/milk_master1.jpg', 500000), 
('image/jpeg', 'PRODUCT', 12, 'milk_master2.jpg', 'milk_master2.jpg', 'uploads/PRODUCT/20260430/milk_master2.jpg', 500000), 
('image/jpeg', 'PRODUCT', 13, 'milk_master3.jpg', 'milk_master3.jpg', 'uploads/PRODUCT/20260430/milk_master3.jpg', 500000), 
('image/jpeg', 'PRODUCT', 14, 'milk_master4.jpg', 'milk_master4.jpg', 'uploads/PRODUCT/20260430/milk_master4.jpg', 500000), 
('image/jpeg', 'PRODUCT', 15, 'milk_master5.jpg', 'milk_master5.jpg', 'uploads/PRODUCT/20260430/milk_master5.jpg', 500000),
('image/jpeg', 'PRODUCT', 16, 'disposable_master1.jpg', 'disposable_master1.jpg', 'uploads/PRODUCT/20260430/disposable_master1.jpg', 500000), 
('image/jpeg', 'PRODUCT', 17, 'disposable_master2.jpg', 'disposable_master2.jpg', 'uploads/PRODUCT/20260430/disposable_master2.jpg', 500000), 
('image/jpeg', 'PRODUCT', 18, 'disposable_master3.jpg', 'disposable_master3.jpg', 'uploads/PRODUCT/20260430/disposable_master3.jpg', 500000), 
('image/jpeg', 'PRODUCT', 19, 'disposable_master4.jpg', 'disposable_master4.jpg', 'uploads/PRODUCT/20260430/disposable_master4.jpg', 500000), 
('image/jpeg', 'PRODUCT', 20, 'disposable_master5.jpg', 'disposable_master5.jpg', 'uploads/PRODUCT/20260430/disposable_master5.jpg', 500000),
('image/jpeg', 'PRODUCT', 21, 'disposable_master6.jpg', 'disposable_master6.jpg', 'uploads/PRODUCT/20260430/disposable_master6.jpg', 500000), 
('image/jpeg', 'PRODUCT', 22, 'disposable_master7.jpg', 'disposable_master7.jpg', 'uploads/PRODUCT/20260430/disposable_master7.jpg', 500000),
('image/jpeg', 'PRODUCT', 23, 'bakery_master1.jpg', 'bakery_master1.jpg', 'uploads/PRODUCT/20260430/bakery_master1.jpg', 500000), 
('image/jpeg', 'PRODUCT', 24, 'bakery_master2.jpg', 'bakery_master2.jpg', 'uploads/PRODUCT/20260430/bakery_master2.jpg', 500000), 
('image/jpeg', 'PRODUCT', 25, 'bakery_master3.jpg', 'bakery_master3.jpg', 'uploads/PRODUCT/20260430/bakery_master3.jpg', 500000), 
('image/jpeg', 'PRODUCT', 26, 'bakery_master4.jpg', 'bakery_master4.jpg', 'uploads/PRODUCT/20260430/bakery_master4.jpg', 500000), 
('image/jpeg', 'PRODUCT', 27, 'bakery_master5.jpg', 'bakery_master5.jpg', 'uploads/PRODUCT/20260430/bakery_master5.jpg', 500000);

-- 6. 초기 재고 (주요 지점 샘플 데이터 확장)
INSERT INTO store_inventory (store_id, product_id, current_stock_qty, safety_stock_qty, auto_order_qty)
SELECT s.store_id, p.product_id, 
    CASE WHEN p.product_id IN (1, 3, 11) THEN 0 ELSE 20 END, -- 일부 품목 품절 처리 (시연용)
    10, 20 
FROM stores s, products p 
WHERE s.type = 'STORE' AND s.store_code IN ('STB00001', 'EDI00001', 'MEG00001', 'PAI00001', 'TWO00001');

-- 7. 발주 내역 (진행 중인 발주, 입고 완료 등 다양화)
-- 스타벅스 강남역점 (STB00001, store_id 8) 샘플
INSERT INTO purchase_orders (po_id, store_id, total_amount, status, created_at, ordered_at, delivered_at) VALUES 
(1001, 8, 450000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1002, 8, 380000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1003, 8, 120000, 'ORDERED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),
(1004, 8, 55000, 'PENDING', NOW(), NULL, NULL);

-- 이디야 상암점 (EDI00001, store_id 23) 샘플
INSERT INTO purchase_orders (po_id, store_id, total_amount, status, created_at, ordered_at, delivered_at) VALUES 
(2001, 23, 210000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(2002, 23, 150000, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2003, 23, 85000, 'ORDERED', NOW(), NOW(), NULL);

INSERT INTO purchase_order_items (po_id, product_id, order_qty, unit_cost_snapshot) VALUES 
(1001, 3, 10, 35000), (1001, 11, 20, 2100),
(1002, 1, 10, 25000), (1002, 6, 5, 12000),
(1003, 3, 3, 35000), (1003, 12, 5, 2300),
(1004, 9, 2, 22000),
(2001, 2, 5, 28000), (2001, 11, 10, 2100),
(2002, 11, 30, 2100), (2002, 21, 2, 32000),
(2003, 2, 2, 28000), (2003, 13, 5, 4500);

-- 8. 재고 로그 (시연용 흐름 생성)
INSERT INTO inventory_logs (store_id, product_id, change_type, before_qty, change_qty, result_qty, created_at) VALUES 
(8, 3, '발주 입고', 5, 10, 15, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(8, 3, '재고 차감', 15, -15, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 1, '발주 입고', 10, 10, 20, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(23, 2, '발주 입고', 2, 5, 7, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(23, 11, '발주 입고', 5, 10, 15, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(23, 11, '재고 차감', 15, -10, 5, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 9. 주간 발주 통계 (최근 8주 데이터 - 그래프용)
-- 스타벅스 강남역점 (store_id 8)
INSERT INTO po_weekly_stats (store_id, base_week, total_po_count, total_po_amount) VALUES 
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 56) DAY), 3, 850000),
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 49) DAY), 4, 1100000),
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 42) DAY), 2, 550000),
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 35) DAY), 5, 1450000),
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 28) DAY), 3, 920000),
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 21) DAY), 4, 1050000),
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 14) DAY), 2, 450000),
(8, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY), 3, 880000);

-- 이디야 상암점 (store_id 23)
INSERT INTO po_weekly_stats (store_id, base_week, total_po_count, total_po_amount) VALUES 
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 56) DAY), 2, 350000),
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 49) DAY), 3, 480000),
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 42) DAY), 2, 310000),
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 35) DAY), 4, 620000),
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 28) DAY), 2, 290000),
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 21) DAY), 3, 440000),
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 14) DAY), 5, 750000),
(23, DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY), 3, 420000);

COMMIT;
