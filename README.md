# ☕ 카페 자동발주 및 점포 관리 시스템

---

## 📌 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| **프로젝트명** | BrewFlow — 카페 자동발주 및 점포 관리 시스템 |
| **개발 기간** | 1주일 |
| **한 줄 소개** | 카페 프랜차이즈 점포별 원재료 재고를 실시간으로 추적하고, 임계치 기반 스케줄러로 발주를 자동화하는 점포 관리 시스템 |

---

## 🎯 주요 기능

### 👤 사용자

- 이메일 회원가입 / 로그인 (JWT 인증)
- 회원가입 시 점포 코드 입력으로 점포 매핑
- 한 유저가 여러 점포 관리 가능
- 프론트 상단 현재 점포명 표시

### 🏪 점포 관리

- 점포 코드 기반 다중 점포 관리
- 점포별 독립적인 재고 및 발주 관리

### 📦 재고 관리

- 원재료 카테고리 및 목록 조회
- 점포별 원재료 재고 현황 조회
- 원재료별 임계치 및 1회 발주 수량 설정
- 재고 수동 차감 (시연용)
- 재고 변경 이력 로그 조회

### ⚙️ 자동발주 (핵심)

- 스케줄러 기반 자동 임계치 체크 및 발주 대기 목록 생성
- 발주 상태 플로우 관리 `PENDING → ORDERED → DELIVERED`
- PENDING 상태에서 발주 수량 수동 조정 및 취소
- 발주 내역 전체 히스토리 조회 (점포 기준 필터)
- DELIVERED 강제 처리 버튼 (시연용)

### 💰 정산

- 월별 청구 금액 조회 (원가 × 수량)
- 점포별 월별 발주 비용 집계
- 비즈니스 연산 서버 사이드 처리

### 📈 통계

- 주별 발주 건수 및 금액 통계 (매주 월요일 크론 집계)
- 통계 집계 연산 서버 사이드 처리

---

## ⚙️ 개발 환경

### Frontend

| 항목 | 내용 |
| --- | --- |
| **언어** | JavaScript |
| **프레임워크** | React |
| **번들러** | Vite |
| **스타일** | Tailwind CSS |
| **상태관리** | Jotai (atom 기반 전역 상태), Custom Hook (비즈니스 로직 분리) |
| **HTTP 클라이언트** | Axios |
| **AI 도구** | Cursor, Claude, AI Studio |

### Backend

| 항목 | 내용 |
| --- | --- |
| **언어** | Java 21 |
| **프레임워크** | Spring Boot 3.x |
| **SQL Mapper** | MyBatis |
| **인증** | Spring Security + JWT |
| **스케줄러** | Spring Scheduler (@Scheduled) |
| **빌드 툴** | Gradle (Groovy) |
| **AI 도구** | Cursor, Claude, AI Studio |

### DB / Infra

| 항목 | 내용 |
| --- | --- |
| **데이터베이스** | MySQL |
| **이미지 서빙** | React assets + Nginx (정적 파일) |
| **서버** | AWS EC2 |
| **배포** | AWS (EC2 + RDS) |
| **운영체제** | Ubuntu (EC2) |
| **컨테이너** | Docker |
| **이미지 저장소** | Docker Hub |
| **CI/CD** | GitHub Actions |

### 협업 / 형상관리

| 항목 | 내용 |
| --- | --- |
| **형상관리** | Git / GitHub (모노레포) |
| **문서화** | Notion |

---

## 🛠 주요 기술

### Backend

- **Spring Scheduler** — 임계치 체크, 발주 실행, 주별 통계 집계 크론 3개 운영
- **JWT (Access + Refresh Token)** — Stateless 인증, Refresh Token DB 저장
- **MyBatis** — XML 기반 SQL 직접 작성, 집계/통계 쿼리 최적화
- **서버 사이드 연산** — 정산, 통계 등 비즈니스 연산 전체 서버에서 처리 (DB/프론트 연산 최소화)
- **트랜잭션 관리** — 발주 상태 변경 및 재고 증감 정합성 보장
- **단가 스냅샷 (Snapshot) 적용** — 원자재 마스터 가격 변동에 과거 정산 내역이 오염되지 않도록 발주 시점의 원가를 복사하여 데이터 정합성 보장

### 스케줄러 구조

| 스케줄러 | 주기 | 역할 |
| --- | --- | --- |
| 임계치 체크 | 매일 N회 | 전체 재고 스캔 → PENDING 발주 생성 |
| 발주 실행 | 매일 1회 | PENDING → ORDERED 일괄 처리 |
| 주별 통계 | 매주 월요일 00:00 | 발주 데이터 주별 집계 |

### 발주 상태 플로우

```
PENDING → ORDERED → DELIVERED
                 ↘ CANCELED
```

### CI/CD 파이프라인

```
코드 push (main 브랜치)
    ↓
GitHub Actions 트리거
    ↓
Gradle 빌드 → JAR 생성
    ↓
Docker 이미지 빌드
    ↓
Docker Hub push
    ↓
EC2 SSH 접속 (appleboy/ssh-action)
    ↓
docker pull → docker run
```

### Frontend

- **Jotai** — 현재 점포 정보 등 전역 상태 atom으로 관리
- **Custom Hook** — 재고 조회, 발주 관리 등 비즈니스 로직 훅으로 분리
- **Cursor AI** — 컴포넌트 및 반복 코드 생성 보조

---

## 🗃 ERD 요약

```
users ──< user_stores >── stores
stores ──< store_inventory >── products
categories ──< products
stores ──< purchase_orders ──< purchase_order_items >── products
stores ──< inventory_logs
stores ──< po_weekly_stats
users ──< refresh_tokens
```

---

## 📋 스코프 외 (추후 확장)

- 관리자 페이지 (카테고리 / 원재료 CRUD)
- 카카오페이 연동 (매출 기반 재고 차감)
- Redis 기반 토큰 관리 개선
- AWS S3 이미지 스토리지 전환 (이미지 규모 증가 시)
- 매출 통계 및 원재료 소비 패턴 분석
