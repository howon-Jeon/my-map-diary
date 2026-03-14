// 장소 카테고리 타입
export type PlaceCategory = '맛집' | '카페' | '산책' | '기타'

// 바텀 시트 상태 타입
export type BottomSheetType = 'new' | 'detail' | 'list' | null

// Supabase places 테이블과 매핑되는 장소 타입
export interface Place {
  id: string
  name: string
  category: PlaceCategory
  memo: string | null
  rating: number | null  // 1~5, 미입력 시 null
  photo_url: string | null
  lat: number
  lng: number
  created_at: string
  updated_at: string
}

// 새 장소 생성 시 사용하는 타입 (id, created_at, updated_at 제외)
export type NewPlace = Omit<Place, 'id' | 'created_at' | 'updated_at'>
