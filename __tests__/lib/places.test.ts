/**
 * places CRUD 함수 테스트
 * Supabase 클라이언트를 mock 처리하여 단위 테스트
 * 주의: jest.mock()은 호이스팅되므로 외부 변수 참조 불가 → 팩토리 내부에서 jest.fn() 직접 사용
 */

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

import { getPlaces, addPlace, updatePlace, deletePlace } from '@/lib/places'
import { supabase } from '@/lib/supabase'
import { NewPlace } from '@/types/place'

const mockFrom = supabase.from as jest.Mock

const sampleNewPlace: NewPlace = {
  name: '테스트 맛집',
  category: '맛집',
  memo: '맛있었다',
  rating: 5,
  photo_url: null,
  lat: 37.5665,
  lng: 126.9780,
}

beforeEach(() => {
  mockFrom.mockClear()
})

describe('getPlaces', () => {
  it('supabase에서 장소 목록을 조회한다', async () => {
    await getPlaces()
    expect(mockFrom).toHaveBeenCalledWith('places')
  })
})

describe('addPlace', () => {
  it('새 장소를 supabase에 삽입한다', async () => {
    await addPlace(sampleNewPlace)
    expect(mockFrom).toHaveBeenCalledWith('places')
  })
})

describe('updatePlace', () => {
  it('기존 장소를 업데이트한다', async () => {
    await updatePlace('test-id', { name: '수정된 맛집' })
    expect(mockFrom).toHaveBeenCalledWith('places')
  })
})

describe('deletePlace', () => {
  it('장소를 삭제한다', async () => {
    await deletePlace('test-id')
    expect(mockFrom).toHaveBeenCalledWith('places')
  })
})
