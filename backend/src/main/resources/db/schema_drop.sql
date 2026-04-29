-- 1. 외래 키 제약 조건 체크 비활성화 (순서 상관없이 지우기 위함)
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 모든 테이블 삭제
DROP TABLE IF EXISTS cert;
DROP TABLE IF EXISTS po_weekly_stats;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS inventory_logs;
DROP TABLE IF EXISTS store_inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users_stores;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS attachments;
DROP VIEW IF EXISTS v_purchase_order_details;
DROP VIEW IF EXISTS v_store_management;

-- 3. 외래 키 제약 조건 체크 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;