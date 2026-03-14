# 나의 지도 다이어리 — 설계 문서

**작성일**: 2026-03-14
**상태**: 승인됨

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

### Storage 버킷: `place-photos`
- 업로드 전 클라이언트에서 1MB 이하로 리사이즈
- 파일명: `{uuid}.{ext}`

---

## 컴포넌트 구조

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
