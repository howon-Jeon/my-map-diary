import { render, screen } from '@testing-library/react'

// KakaoMap은 브라우저 전용 → mock
jest.mock('@/components/Map/KakaoMap', () => ({
  __esModule: true,
  default: ({ onMapClick }: any) => (
    <div data-testid="kakao-map" onClick={() => onMapClick(37.5, 126.9)}>
      지도 영역
    </div>
  ),
}))

// Supabase mock
jest.mock('@/lib/places', () => ({
  getPlaces: jest.fn().mockResolvedValue([]),
}))

import HomePage from '@/app/page'

describe('HomePage', () => {
  it('지도 컴포넌트를 렌더링한다', async () => {
    render(<HomePage />)
    expect(screen.getByTestId('kakao-map')).toBeInTheDocument()
  })

  it('FAB 버튼(목록 버튼)을 렌더링한다', async () => {
    render(<HomePage />)
    expect(screen.getByRole('button', { name: /내 장소 목록/i })).toBeInTheDocument()
  })
})
