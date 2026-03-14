import { render, screen, fireEvent } from '@testing-library/react'
import PlaceListSheet from '@/components/BottomSheet/PlaceListSheet'
import { Place } from '@/types/place'

const mockPlaces: Place[] = [
  {
    id: '1',
    name: '강남 맛집',
    category: '맛집',
    memo: null,
    rating: 5,
    photo_url: null,
    lat: 37.497,
    lng: 127.027,
    created_at: '2026-03-14T00:00:00Z',
    updated_at: '2026-03-14T00:00:00Z',
  },
]

describe('PlaceListSheet', () => {
  it('장소 목록을 렌더링한다', () => {
    render(
      <PlaceListSheet places={mockPlaces} onSelectPlace={jest.fn()} />
    )
    expect(screen.getByText('강남 맛집')).toBeInTheDocument()
  })

  it('장소가 없으면 안내 메시지를 표시한다', () => {
    render(<PlaceListSheet places={[]} onSelectPlace={jest.fn()} />)
    expect(screen.getByText(/저장된 장소가 없습니다/i)).toBeInTheDocument()
  })

  it('장소 카드 클릭 시 onSelectPlace 호출', () => {
    const mockOnSelect = jest.fn()
    render(
      <PlaceListSheet places={mockPlaces} onSelectPlace={mockOnSelect} />
    )
    fireEvent.click(screen.getByText('강남 맛집'))
    expect(mockOnSelect).toHaveBeenCalledWith(mockPlaces[0])
  })
})
