# 나의 지도 다이어리 — 설계 문서

**작성일**: 2026-03-14
**상태**: 승인됨 (리뷰 반영 v2)

---

## 개요

맛집, 인상적인 장소, 재밌었던 곳들을 지도에 핀으로 기록하는 개인용 지도 다이어리 웹앱.
모바일 브라우저 중심으로 사용하며, 지도를 탭해 핀을 꽂고 바텀 시트로 정보를 입력한다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 지도 | Kakao Map API |
| 백엔드/DB | Supabase (PostgreSQL) |
| 파일 저장 | Supabase Storage |
| 스타일링 | Tailwind CSS |
| 언어 | TypeScript |

---

## 화면 구조

단일 페이지(`/`) 구성. 지도가 항상 배경에 유지되고, 모든 인터랙션은 **바텀 시트(Bottom Sheet)** 로 처리한다.

```
[ Kakao Map 전체화면 ]
    ↓ 지도 빈 공간 탭
[ 바텀 시트: 새 장소 등록 ]

    ↓ 기존 마커 탭
[ 바텀 시트: 장소 상세 / 수정 / 삭제 ]

    ↓ 우하단 FAB 버튼 탭
[ 바텀 시트: 내 장소 목록 (카드 리스트) ]
```

URL 라우팅 없이 React state로 바텀 시트 상태 제어.

**상태 관리 전략**: `page.tsx`에서 React `useState`로 전역 상태 관리. 지도 선택 좌표, 활성 바텀 시트 종류, 선택된 장소 ID, 장소 목록 캐시를 관리. 컴포넌트 간 props로 전달 (Zustand 등 외부 라이브러리 미사용 — YAGNI). 컴포넌트 깊이가 깊어지면 Context API로 전환.

**바텀 시트 닫기 방식**: 상단 드래그 핸들을 아래로 스와이프 또는 배경(지도) 탭. touch 이벤트와 지도 스크롤 충돌 방지를 위해 시트 열린 상태에서 지도 터치 이벤트를 비활성화.

---

## 데이터 모델 (Supabase)

### 테이블: `places`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | uuid | PK, default gen_random_uuid() | 고유 식별자 |
| `name` | text | NOT NULL | 장소 이름 / 별명 |
| `category` | text | NOT NULL | 맛집 / 카페 / 산책 / 기타 |
| `memo` | text | nullable | 메모 / 일기 |
| `rating` | integer | 1~5 | 개인 별점 |
| `photo_url` | text | nullable | Supabase Storage 이미지 URL |
| `lat` | float8 | NOT NULL | 위도 |
| `lng` | float8 | NOT NULL | 경도 |
| `created_at` | timestamptz | default now() | 생성일시 |

### 테이블 제약 상세

- `category`: DB 레벨 `CHECK (category IN ('맛집', '카페', '산책', '기타'))` 제약 적용
- `rating`: nullable (선택 항목). 별점 미입력 시 NULL 저장. StarRating 컴포넌트는 0(미선택) 상태 지원
- `updated_at`: timestamptz, `moddatetime` 트리거로 자동 갱신 (수정 이력 추적)

### Storage 버킷: `place-photos`
- 업로드 전 클라이언트에서 `browser-image-compression` 라이브러리로 1MB 이하 리사이즈
- iOS Safari에서는 `<input accept="image/*" capture="environment">` 방식 사용 (카메라 직접 연동)
- 파일명: `{uuid}.{ext}`
- **의도적 제약**: MVP에서는 사진 1장만 지원. 추후 `place_photos` 별도 테이블로 확장 가능

### Supabase 보안 정책 (RLS)

단일 사용자 개인용 앱 전제 하에 **RLS 비활성화** 방식을 선택한다:
- `anon` 키는 `.env.local`에만 보관하며 배포 시 외부에 노출되지 않는 환경에서 사용
- 향후 타인과 공유하거나 퍼블릭 배포 시 Supabase Anonymous Auth로 전환 필요

### 환경 변수 목록

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=
```

---

## 컴포넌트 구조

**Kakao Map SDK 로딩 전략**: `KakaoMap.tsx`는 `'use client'` 전용 컴포넌트. `next/script`의 `strategy='afterInteractive'`로 SDK를 로드하고, `window.kakao` 준비 후 지도를 초기화. SSR에서는 렌더링하지 않음(`typeof window === 'undefined'` 체크).

**목록 정렬**: 기본 정렬 `created_at DESC`(최신순). MVP에서 페이지네이션 없이 전체 목록 단순 스크롤.

```
app/
├── page.tsx                      ← 싱글 페이지, 상태 관리 루트
├── components/
│   ├── Map/
│   │   ├── KakaoMap.tsx          ← 지도 렌더링, 탭/클릭 이벤트 처리
│   │   └── PlaceMarker.tsx       ← 개별 마커 (카테고리별 아이콘)
│   ├── BottomSheet/
│   │   ├── BottomSheet.tsx       ← 슬라이드업 공통 컨테이너 (애니메이션)
│   │   ├── NewPlaceSheet.tsx     ← 새 장소 등록 폼
│   │   ├── PlaceDetailSheet.tsx  ← 장소 상세 보기 / 수정 / 삭제
│   │   └── PlaceListSheet.tsx    ← 내 장소 목록 카드 리스트
│   └── UI/
│       ├── StarRating.tsx        ← 별점 입력 (터치 친화적)
│       └── PhotoUpload.tsx       ← 사진 첨부 및 미리보기
├── lib/
│   ├── supabase.ts               ← Supabase 클라이언트 초기화
│   └── places.ts                 ← CRUD 함수 (getPlaces, addPlace, updatePlace, deletePlace)
└── types/
    └── place.ts                  ← Place 타입 정의
```

---

## 핵심 사용자 흐름

### 1. 새 장소 등록
1. 지도에서 원하는 위치 탭
2. 탭한 좌표에 임시 마커 표시
3. 바텀 시트 슬라이드업 → 등록 폼
4. 이름(필수), 카테고리(필수), 메모(선택), 별점(선택), 사진(선택) 입력
5. [저장] 클릭 → Supabase에 저장 → 지도에 마커 반영

### 2. 장소 확인
1. 지도의 마커 탭
2. 바텀 시트 슬라이드업 → 저장된 정보 표시
3. [수정] 또는 [삭제] 가능

### 3. 내 장소 목록
1. 우하단 FAB 버튼 탭
2. 전체 장소를 카드 리스트로 표시 (이름, 카테고리, 별점, 날짜)
3. 카드 탭 → 해당 위치로 지도 이동 + 상세 시트 표시

---

## 에러 처리

| 상황 | 처리 방법 |
|------|-----------|
| Supabase 저장 실패 | 토스트 메시지 "저장에 실패했습니다. 다시 시도해주세요." |
| 사진 업로드 실패 | 사진 없이 장소만 저장 (사진은 선택 항목) |
| Kakao Map 로딩 중 | 전체화면 로딩 스피너 표시 |
| 네트워크 없음 | "인터넷 연결을 확인해주세요." 토스트 표시 |

---

## 외부 서비스 설정 가이드

구현 단계에서 필요한 시점에 안내를 제공한다.

| 서비스 | 필요 시점 | 비고 |
|--------|-----------|------|
| Kakao Map API 키 | Step 2: 지도 컴포넌트 구현 전 | 무료, kakao developers 가입 필요 |
| Supabase 프로젝트 | Step 3: DB 연동 전 | 무료 티어 충분, 프로젝트 생성 안내 |
| Vercel 배포 | Step 6: 최종 배포 단계 | GitHub 연동, 환경변수 설정 안내 |

---

## MVP 범위 (포함 / 제외)

### ✅ 포함
- 지도 탭으로 핀 꽂기
- 장소 등록 (이름, 카테고리, 메모, 별점, 사진)
- 장소 수정 / 삭제
- 내 장소 목록 보기
- 모바일 반응형 UI

### ❌ MVP에서 제외
- 로그인 / 사용자 인증 (단일 사용자 앱으로 시작)
- 장소 검색 기능
- 소셜 공유
- 오프라인 모드

---

## 성공 기준

- 지도 탭 → 핀 꽂기 → 정보 입력 → 저장까지 3탭 이내에 완료 가능
- 저장된 장소가 앱 재시작 후에도 지도에 표시됨
- 사진 포함 장소 등록이 모바일에서 자연스럽게 동작
